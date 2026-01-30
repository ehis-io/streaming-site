import { Scraper, StreamLink } from './scraper.interface';
import { TmdbService } from '../tmdb/tmdb.service';
import type { Cache } from 'cache-manager';
export declare class ProvidersService {
    private scrapers;
    private tmdbService;
    private cacheManager;
    private readonly logger;
    constructor(scrapers: Scraper[], tmdbService: TmdbService, cacheManager: Cache);
    getScrapers(): Scraper[];
    findStreamLinks(id: string, season?: number, episode?: number): Promise<StreamLink[]>;
}
