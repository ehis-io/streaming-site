"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ProvidersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvidersService = void 0;
const common_1 = require("@nestjs/common");
const scraper_interface_1 = require("./scraper.interface");
const tmdb_service_1 = require("../tmdb/tmdb.service");
const cache_manager_1 = require("@nestjs/cache-manager");
let ProvidersService = ProvidersService_1 = class ProvidersService {
    scrapers;
    tmdbService;
    cacheManager;
    logger = new common_1.Logger(ProvidersService_1.name);
    constructor(scrapers, tmdbService, cacheManager) {
        this.scrapers = scrapers;
        this.tmdbService = tmdbService;
        this.cacheManager = cacheManager;
        this.scrapers = Array.isArray(this.scrapers) ? this.scrapers : (this.scrapers ? [this.scrapers] : []);
        this.scrapers.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        this.logger.log(`Registered ${this.scrapers.length} scrapers: ${this.scrapers.map(s => s.name).join(', ')}`);
    }
    getScrapers() {
        return this.scrapers;
    }
    async findStreamLinks(id, season, episode) {
        const cacheKey = `streams:${id}:${season || ''}:${episode || ''}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            this.logger.log(`Returned cached streams for ${cacheKey}`);
            return cached;
        }
        const tmdbId = parseInt(id);
        if (isNaN(tmdbId))
            return [];
        const type = (season && episode) ? 'tv' : 'movie';
        let title = '';
        try {
            const details = await this.tmdbService.getDetails(tmdbId, type);
            title = type === 'movie' ? details.title : details.name;
        }
        catch (e) {
            this.logger.error(`Failed to fetch metadata for ${id}: ${e.message}`);
            return [];
        }
        this.logger.log(`Resolving streams for ${title} (${type})`);
        const allLinks = [];
        const promises = this.scrapers.map(async (scraper) => {
            try {
                const results = await scraper.search(title, tmdbId);
                if (results.length > 0) {
                    const match = results[0];
                    const links = await scraper.getStreamLinks(match.url, season && episode ? { season, episode } : undefined);
                    return links.map(l => ({ ...l, provider: scraper.name }));
                }
            }
            catch (e) {
                this.logger.warn(`${scraper.name} failed: ${e.message}`);
            }
            return [];
        });
        const scraperResults = await Promise.all(promises);
        scraperResults.forEach(res => {
            if (res)
                allLinks.push(...res);
        });
        if (allLinks.length > 0) {
            await this.cacheManager.set(cacheKey, allLinks, 7200000);
        }
        return allLinks;
    }
};
exports.ProvidersService = ProvidersService;
exports.ProvidersService = ProvidersService = ProvidersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(scraper_interface_1.SCRAPER_TOKEN)),
    __param(2, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Array, tmdb_service_1.TmdbService, Object])
], ProvidersService);
//# sourceMappingURL=providers.service.js.map