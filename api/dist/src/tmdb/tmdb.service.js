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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var TmdbService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TmdbService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cache_manager_1 = require("@nestjs/cache-manager");
const axios_1 = __importDefault(require("axios"));
let TmdbService = TmdbService_1 = class TmdbService {
    configService;
    cacheManager;
    baseUrl = 'https://api.themoviedb.org/3';
    apiKey;
    logger = new common_1.Logger(TmdbService_1.name);
    constructor(configService, cacheManager) {
        this.configService = configService;
        this.cacheManager = cacheManager;
        this.apiKey = this.configService.get('TMDB_API_KEY') || '';
    }
    async getCachedRequest(key, url, params, ttl = 3600000) {
        const cached = await this.cacheManager.get(key);
        if (cached) {
            return cached;
        }
        if (!this.apiKey || this.apiKey.includes('your_tmdb_api_key')) {
            this.logger.warn(`TMDB API Key missing or invalid. Returning empty/mock for ${key}`);
            return { results: [], mock: true };
        }
        try {
            const response = await axios_1.default.get(url, { params: { ...params, api_key: this.apiKey } });
            await this.cacheManager.set(key, response.data, ttl);
            return response.data;
        }
        catch (e) {
            this.logger.error(`TMDB request failed: ${e.message}`);
            throw e;
        }
    }
    async getTrending(type = 'movie') {
        return this.getCachedRequest(`trending:${type}`, `${this.baseUrl}/trending/${type}/day`, {});
    }
    async search(query, type = 'movie') {
        return this.getCachedRequest(`search:${type}:${query}`, `${this.baseUrl}/search/${type}`, { query });
    }
    async getDetails(id, type = 'movie') {
        return this.getCachedRequest(`details:${type}:${id}`, `${this.baseUrl}/${type}/${id}`, {});
    }
};
exports.TmdbService = TmdbService;
exports.TmdbService = TmdbService = TmdbService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [config_1.ConfigService, Object])
], TmdbService);
//# sourceMappingURL=tmdb.service.js.map