import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import {
    JikanClient,
    AnimeEndpoint,
    MangaEndpoint,
    SeasonsEndpoint,
    TopEndpoint,
    GenresEndpoint
} from 'myanimelist-wrapper';

@Injectable()
export class MALService {
    private readonly logger = new Logger(MALService.name);

    constructor(
        private configService: ConfigService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private jikanClient: JikanClient,
        private animeEndpoint: AnimeEndpoint,
        private mangaEndpoint: MangaEndpoint,
        private seasonsEndpoint: SeasonsEndpoint,
        private topEndpoint: TopEndpoint,
        private genresEndpoint: GenresEndpoint,
    ) { }

    private async getCachedRequest<T>(key: string, requestFn: () => Promise<T>, ttl: number = 3600000): Promise<T> {
        const cached = await this.cacheManager.get<T>(key);
        if (cached) {
            return cached;
        }

        try {
            const data = await requestFn();
            await this.cacheManager.set(key, data, ttl);
            return data;
        } catch (e) {
            this.logger.error(`MAL request failed for key ${key}: ${e.message}`);
            throw e;
        }
    }

    async getTrending(page: number = 1) {
        return this.getCachedRequest(`mal:trending:page:${page}`, () =>
            this.seasonsEndpoint.getCurrent({ page })
        );
    }

    async search(query: string, page: number = 1) {
        return this.getCachedRequest(`mal:search:${query}:page:${page}`, () =>
            this.animeEndpoint.search({ q: query, page })
        );
    }

    async getDetails(id: number) {
        return this.getCachedRequest(`mal:details:${id}`, () =>
            this.animeEndpoint.getById(id)
        );
    }

    async getGenres() {
        return this.getCachedRequest(`mal:genres`, () =>
            this.genresEndpoint.getAnimeGenres()
        );
    }

    async getRecommendations(id: number) {
        return this.getCachedRequest(`mal:recommendations:${id}`, () =>
            this.animeEndpoint.getRecommendations(id)
        );
    }
}