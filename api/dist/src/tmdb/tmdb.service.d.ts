import { ConfigService } from '@nestjs/config';
import type { Cache } from 'cache-manager';
export declare class TmdbService {
    private configService;
    private cacheManager;
    private readonly baseUrl;
    private readonly apiKey;
    private readonly logger;
    constructor(configService: ConfigService, cacheManager: Cache);
    private getCachedRequest;
    getTrending(type?: 'movie' | 'tv'): Promise<any>;
    search(query: string, type?: 'movie' | 'tv'): Promise<any>;
    getDetails(id: number, type?: 'movie' | 'tv'): Promise<any>;
}
