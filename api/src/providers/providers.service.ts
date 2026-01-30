import { Injectable, Logger, Inject } from '@nestjs/common';
import { Scraper, StreamLink, SCRAPER_TOKEN } from './scraper.interface';
import { TmdbService } from '../tmdb/tmdb.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);

  constructor(
    @Inject(SCRAPER_TOKEN) private scrapers: Scraper[],
    private tmdbService: TmdbService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    // Ensure scrapers is an array (handles cases where NestJS might inject a single object or nothing)
    this.scrapers = Array.isArray(this.scrapers) ? this.scrapers : (this.scrapers ? [this.scrapers] : []);
    this.scrapers.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    this.logger.log(`Registered ${this.scrapers.length} scrapers: ${this.scrapers.map(s => s.name).join(', ')}`);
  }

  getScrapers(): Scraper[] {
    return this.scrapers;
  }

  async findStreamLinks(id: string, season?: number, episode?: number): Promise<StreamLink[]> {
    const cacheKey = `streams:${id}:${season || ''}:${episode || ''}`;
    const cached = await this.cacheManager.get<StreamLink[]>(cacheKey);
    if (cached) {
        this.logger.log(`Returned cached streams for ${cacheKey}`);
        return cached;
    }

    const tmdbId = parseInt(id);
    if (isNaN(tmdbId)) return [];

    const type = (season && episode) ? 'tv' : 'movie';
    let title = '';

    try {
      const details = await this.tmdbService.getDetails(tmdbId, type);
      title = type === 'movie' ? details.title : details.name;
    } catch (e) {
      this.logger.error(`Failed to fetch metadata for ${id}: ${e.message}`);
      return [];
    }

    this.logger.log(`Resolving streams for ${title} (${type})`);
    
    const allLinks: StreamLink[] = [];
    const promises = this.scrapers.map(async (scraper) => {
      try {
        const results = await scraper.search(title, tmdbId);
        if (results.length > 0) {
           // Basic matching: use first result. Improve matching logic later.
           const match = results[0];
           const links = await scraper.getStreamLinks(match.url, season && episode ? { season, episode } : undefined);
           return links.map(l => ({ ...l, provider: scraper.name }));
        }
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
        await this.cacheManager.set(cacheKey, allLinks, 7200000); // 2 hours
    }

    return allLinks;
  }
}
