import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import axios from 'axios';

@Injectable()
export class TmdbService {
  private readonly baseUrl = 'https://api.themoviedb.org/3';
  private readonly apiKey: string;
  private readonly logger = new Logger(TmdbService.name);

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.apiKey = this.configService.get<string>('TMDB_API_KEY') || '';
  }

  private async getCachedRequest(key: string, url: string, params: any, ttl: number = 3600000) {
    const cached = await this.cacheManager.get(key);
    if (cached) {
      return cached;
    }

    if (!this.apiKey || this.apiKey.includes('your_tmdb_api_key')) {
        this.logger.warn(`TMDB API Key missing or invalid. Returning empty/mock for ${key}`);
        // Return minimal mock to prevent crash during setup
        return { results: [], mock: true };
    }
    
    try {
        const response = await axios.get(url, { params: { ...params, api_key: this.apiKey } });
        await this.cacheManager.set(key, response.data, ttl);
        return response.data;
    } catch (e) {
        this.logger.error(`TMDB request failed: ${e.message}`);
        throw e;
    }
  }

  async getTrending(type: 'movie' | 'tv' = 'movie') {
    return this.getCachedRequest(`trending:${type}`, `${this.baseUrl}/trending/${type}/day`, {});
  }

  async search(query: string, type: 'movie' | 'tv' = 'movie') {
     return this.getCachedRequest(`search:${type}:${query}`, `${this.baseUrl}/search/${type}`, { query });
  }

  async getDetails(id: number, type: 'movie' | 'tv' = 'movie') {
     return this.getCachedRequest(`details:${type}:${id}`, `${this.baseUrl}/${type}/${id}`, {});
  }
}
