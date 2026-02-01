import { Injectable, Logger, Inject } from '@nestjs/common';
import { Scraper, StreamLink, ScraperSearchResult, SCRAPER_TOKEN } from './scraper.interface';
import { TmdbService } from '../tmdb/tmdb.service';
import { MALService } from '../mal/mal.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);

  constructor(
    @Inject(SCRAPER_TOKEN) private scrapers: Scraper[],
    private tmdbService: TmdbService,
    private malService: MALService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService,
  ) {
    // Ensure scrapers is an array (handles cases where NestJS might inject a single object or nothing)
    this.scrapers = Array.isArray(this.scrapers) ? this.scrapers : (this.scrapers ? [this.scrapers] : []);
    this.scrapers.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    this.logger.log(`Registered ${this.scrapers.length} scrapers: ${this.scrapers.map(s => s.name).join(', ')}`);
  }

  getScrapers(): Scraper[] {
    return this.scrapers;
  }

  async findStreamLinks(id: string, season?: number, episode?: number, type: 'sub' | 'dub' = 'sub', mediaType?: string): Promise<StreamLink[]> {
    const cacheKey = `streams:${id}:${season || ''}:${episode || ''}:${type}:${mediaType || ''}`;
    const cached = await this.cacheManager.get<StreamLink[]>(cacheKey);
    if (cached) {
      this.logger.log(`Returned cached streams for ${cacheKey}`);
      return cached;
    }

    // Check Database for persistent storage
    const numericId = parseInt(id);
    if (isNaN(numericId)) return [];

    let activeMediaType = mediaType;
    if (!activeMediaType) {
      activeMediaType = (season && episode) ? 'tv' : 'movie';
    }

    const dbLinks = await (this.prisma as any).streamedLink.findMany({
      where: activeMediaType === 'anime'
        ? { malId: numericId, episode: episode || 1 }
        : { tmdbId: numericId, season: season || null, episode: episode || null }
    });

    if (dbLinks.length > 0) {
      this.logger.log(`Found ${dbLinks.length} streams in DB for ${id}`);
      const links = dbLinks.map(dbLink => ({
        url: dbLink.url,
        quality: dbLink.quality || 'Auto',
        isM3U8: dbLink.isM3U8,
        provider: dbLink.provider,
        headers: dbLink.headers ? JSON.parse(dbLink.headers) : undefined
      }));
      // Also cache in Redis for faster access
      await this.cacheManager.set(cacheKey, links, 86400000);
      return links;
    }

    let title = '';
    let tmdbId: number | undefined;
    let malId: number | undefined;
    let imdbId: string | undefined;

    let details: any;
    try {
      if (activeMediaType === 'anime') {
        malId = numericId;
        const animeResponse = await this.malService.getDetails(malId);
        details = (animeResponse as any).data;
        title = details.title;

        // Try to map MAL Anime to TMDB TV Show by title
        try {
          const searchRes = await this.tmdbService.search(title, 'tv');
          if (searchRes.results && searchRes.results.length > 0) {
            // Best effort: take first result. 
            // In production, we might want to check release year or fuzzy match title.
            tmdbId = searchRes.results[0].id;
            this.logger.log(`Mapped Anime "${title}" (MAL: ${malId}) to TMDB ID: ${tmdbId}`);
          } else {
            this.logger.warn(`Could not find TMDB match for Anime "${title}"`);
          }
        } catch (searchError) {
          this.logger.warn(`TMDB search failed for Anime mapping: ${searchError.message}`);
        }

      } else {
        tmdbId = numericId;
        details = await this.tmdbService.getDetails(tmdbId, activeMediaType as 'movie' | 'tv');
        title = activeMediaType === 'movie' ? details.title : details.name;
        imdbId = details.external_ids?.imdb_id || details.imdb_id;
      }
    } catch (e) {
      this.logger.error(`Failed to fetch metadata for ${id} (${activeMediaType}): ${e.message}`);
      return [];
    }

    this.logger.log(`Resolving streams for ${title} (${activeMediaType})`);

    const allLinks: StreamLink[] = [];
    const promises = this.scrapers.map(async (scraper) => {
      try {
        let searchResults: ScraperSearchResult[] = [];

        // Check for existing mapping to skip search
        const mapping = await (this.prisma as any).providerMapping.findFirst({
          where: activeMediaType === 'anime'
            ? { malId: malId || undefined, provider: scraper.name }
            : { tmdbId: tmdbId || undefined, provider: scraper.name }
        });

        if (mapping) {
          this.logger.debug(`Using mapped URL for ${scraper.name}: ${mapping.externalUrl}`);
          searchResults = [{
            title: title || 'Media',
            url: mapping.externalUrl
          }];
        } else {
          searchResults = await scraper.search(title, tmdbId, imdbId, malId);

          // Save the first mapping for future use
          if (searchResults.length > 0) {
            const bestResult = searchResults[0];
            try {
              // Manual find to handle overlapping unique constraints safely on MongoDB
              const existingMapping = await (this.prisma as any).providerMapping.findFirst({
                where: {
                  provider: scraper.name,
                  OR: [
                    tmdbId ? { tmdbId } : undefined,
                    malId ? { malId } : undefined,
                  ].filter(Boolean) as any
                }
              });

              if (existingMapping) {
                await (this.prisma as any).providerMapping.update({
                  where: { id: existingMapping.id },
                  data: {
                    externalUrl: bestResult.url,
                    // Update IDs if they were missing but are now found
                    tmdbId: tmdbId || existingMapping.tmdbId,
                    malId: malId || existingMapping.malId
                  }
                });
              } else {
                await (this.prisma as any).providerMapping.create({
                  data: {
                    tmdbId: tmdbId || null,
                    malId: malId || null,
                    provider: scraper.name,
                    externalUrl: bestResult.url
                  }
                });
              }
            } catch (mapError) {
              this.logger.debug(`Could not save provider mapping: ${mapError.message}`);
            }
          }
        }

        const scraperLinksPromises = searchResults.map(async (result) => {
          try {
            const streamParams = (activeMediaType === 'anime' || (season && episode))
              ? { season, episode: episode || 1, type }
              : undefined;

            const links = await scraper.getStreamLinks(result.url, streamParams);
            return links.map(l => ({
              ...l,
              provider: result.title.includes('(') ? result.title : `${scraper.name} (${new URL(result.url).hostname})`
            }));
          } catch (e) {
            this.logger.warn(`${scraper.name} mirror ${result.url} failed: ${e.message}`);
            return [];
          }
        });

        const nestedResults = await Promise.all(scraperLinksPromises);
        const flatLinks = nestedResults.flat();

        // Validate streams (check for "Not Found" or specific error text)
        // This is important for providers that return 200 OK even for error pages
        const validLinks: StreamLink[] = [];
        for (const link of flatLinks) {
          if (await this.validateStream(link.url)) {
            validLinks.push(link);
          } else {
            this.logger.warn(`Filtered out invalid stream: ${link.url}`);
          }
        }

        return validLinks;
      } catch (e) {
        this.logger.warn(`${scraper.name} failed: ${e.message}`);
      }
      return [];
    });

    const scraperResults = await Promise.all(promises);
    scraperResults.forEach(res => {
      if (res) allLinks.push(...res);
    });

    if (allLinks.length > 0) {
      await this.cacheManager.set(cacheKey, allLinks, 86400000); // 24 hours

      // Persist to Database for long-term cache
      try {
        const createManyParams = allLinks.map(link => ({
          tmdbId: activeMediaType !== 'anime' ? tmdbId : null,
          malId: activeMediaType === 'anime' ? malId : null,
          season: season || null,
          episode: episode || null,
          url: link.url,
          quality: link.quality,
          isM3U8: !!link.isM3U8,
          provider: link.provider || 'Unknown',
          headers: link.headers ? JSON.stringify(link.headers) : null
        }));

        // Avoid duplicates if same URL exists for same ID/EP
        for (const data of createManyParams) {
          await (this.prisma as any).streamedLink.upsert({
            where: {
              // We need a unique constraint to avoid duplicates. 
              // Since schema doesn't have one yet, we'll check first or just create if missing.
              id: '000000000000000000000000' // dummy since we don't have unique index on url+id+ep yet
            },
            update: {},
            create: data
          }).catch(async () => {
            // Fallback for missing unique constraint: just create if not exists
            const existing = await (this.prisma as any).streamedLink.findFirst({
              where: {
                url: data.url,
                tmdbId: data.tmdbId,
                malId: data.malId,
                season: data.season,
                episode: data.episode
              }
            });
            if (!existing) {
              await (this.prisma as any).streamedLink.create({ data });
            }
          });
        }
      } catch (dbError) {
        this.logger.warn(`Failed to save streams to DB: ${dbError.message}`);
      }
    }

    return allLinks;
  }

  private async validateStream(url: string): Promise<boolean> {
    try {
      // Simple head check or fetch first bytes?
      // Some providers return 200 OK with "Video not found" text. 
      // We'll scrape the content to check for error messages.
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 15000
      });

      const data = response.data;
      if (typeof data === 'string') {
        const lowerData = data.toLowerCase();
        if (lowerData.includes("we coudn't find this episode") ||
          lowerData.includes("please check back another time") ||
          lowerData.includes("404 not found") ||
          lowerData.includes("video not found")) {
          return false;
        }
      }
      return true;
    } catch (e) {
      // If it returns 404/500, it's invalid
      this.logger.debug(`Stream validation failed for ${url}: ${e.message}`);
      return false;
    }
  }
}
