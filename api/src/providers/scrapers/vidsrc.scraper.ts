import { Injectable, Logger } from '@nestjs/common';
import { Scraper, ScraperSearchResult, StreamLink } from '../scraper.interface';

@Injectable()
export class VidSrcScraper implements Scraper {
  name = 'VidSrc';
  priority = 8;
  private readonly logger = new Logger(VidSrcScraper.name);
  private readonly baseUrl = 'https://vidsrc.xyz/embed';
  private readonly apiUrl = 'https://vidsrc.to/embed';

  async search(query: string, tmdbId?: number): Promise<ScraperSearchResult[]> {
    // VidSrc works with TMDB IDs, so if we have one, use it
    if (!tmdbId) {
      this.logger.warn('VidSrc requires TMDB ID, cannot search by title alone');
      return [];
    }

    // We'll determine type based on context - for now assume movie
    // The ProvidersService will call this with the correct type context
    const movieUrl = `${this.apiUrl}/movie/${tmdbId}`;
    
    return [{
      title: query,
      url: movieUrl,
      poster: ''
    }];
  }

  async getStreamLinks(url: string, episode?: { season: number, episode: number }): Promise<StreamLink[]> {
    this.logger.log(`Fetching stream from ${url}`);
    
    try {
      // Construct the proper embed URL
      let embedUrl = url;
      
      // If it's a TV show with episode info, modify the URL
      if (episode && url.includes('/movie/')) {
        // Convert movie URL to TV URL with season/episode
        const tmdbId = url.split('/movie/')[1];
        embedUrl = `${this.apiUrl}/tv/${tmdbId}/${episode.season}/${episode.episode}`;
      } else if (episode && url.includes('/tv/')) {
        // Already a TV URL, append season/episode if not present
        if (!url.includes(`/${episode.season}/${episode.episode}`)) {
          const tmdbId = url.split('/tv/')[1].split('/')[0];
          embedUrl = `${this.apiUrl}/tv/${tmdbId}/${episode.season}/${episode.episode}`;
        }
      }

      this.logger.log(`VidSrc embed URL: ${embedUrl}`);

      // VidSrc.to embed pages handle streaming internally
      // Return the embed URL directly as an iframe source
      return [{
        url: embedUrl,
        quality: '1080p',
        isM3U8: false, // This is an embed URL, not a direct stream
        headers: { 
          'Referer': 'https://vidsrc.to/',
          'Origin': 'https://vidsrc.to'
        }
      }];

    } catch (error) {
      this.logger.error(`VidSrc scraping failed: ${error.message}`);
      return [];
    }
  }
}
