"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SimpleScraper_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleScraper = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
let SimpleScraper = SimpleScraper_1 = class SimpleScraper {
    name = 'SimpleScraper';
    priority = 5;
    logger = new common_1.Logger(SimpleScraper_1.name);
    providers = [
        { name: 'VidSrc', searchUrl: (q) => `https://vidsrc.to/search/${encodeURIComponent(q)}`, selector: '.movie-item a' },
        { name: 'VidLink', searchUrl: (q) => `https://vidlink.pro/search?q=${encodeURIComponent(q)}`, selector: '.result-card a' },
        { name: 'AutoEmbed', searchUrl: (q) => `https://autoembed.to/movie/${encodeURIComponent(q)}`, selector: 'a.play-link' }
    ];
    async search(query, tmdbId) {
        this.logger.log(`Searching for "${query}"`);
        const results = [];
        for (const provider of this.providers) {
            try {
                const { data } = await axios_1.default.get(provider.searchUrl(query), { timeout: 5000 });
                const $ = cheerio.load(data);
                const movieUrl = $(provider.selector).first().attr('href');
                if (movieUrl) {
                    const fullUrl = movieUrl.startsWith('http') ? movieUrl : `https://${provider.name.toLowerCase()}.to${movieUrl}`;
                    results.push({
                        title: query,
                        url: fullUrl
                    });
                    break;
                }
            }
            catch (err) {
                this.logger.warn(`${provider.name} search failed: ${err.message}`);
            }
        }
        return results;
    }
    async getStreamLinks(url, episode) {
        this.logger.log(`SimpleScraper: Skipping puppeteer extraction for ${url}`);
        return [];
    }
};
exports.SimpleScraper = SimpleScraper;
exports.SimpleScraper = SimpleScraper = SimpleScraper_1 = __decorate([
    (0, common_1.Injectable)()
], SimpleScraper);
//# sourceMappingURL=simple.scraper.js.map