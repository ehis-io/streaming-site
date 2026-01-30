"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var VidSrcScraper_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VidSrcScraper = void 0;
const common_1 = require("@nestjs/common");
let VidSrcScraper = VidSrcScraper_1 = class VidSrcScraper {
    name = 'VidSrc';
    priority = 8;
    logger = new common_1.Logger(VidSrcScraper_1.name);
    baseUrl = 'https://vidsrc.xyz/embed';
    apiUrl = 'https://vidsrc.to/embed';
    async search(query, tmdbId) {
        if (!tmdbId) {
            this.logger.warn('VidSrc requires TMDB ID, cannot search by title alone');
            return [];
        }
        const movieUrl = `${this.apiUrl}/movie/${tmdbId}`;
        return [{
                title: query,
                url: movieUrl,
                poster: ''
            }];
    }
    async getStreamLinks(url, episode) {
        this.logger.log(`Fetching stream from ${url}`);
        try {
            let embedUrl = url;
            if (episode && url.includes('/movie/')) {
                const tmdbId = url.split('/movie/')[1];
                embedUrl = `${this.apiUrl}/tv/${tmdbId}/${episode.season}/${episode.episode}`;
            }
            else if (episode && url.includes('/tv/')) {
                if (!url.includes(`/${episode.season}/${episode.episode}`)) {
                    const tmdbId = url.split('/tv/')[1].split('/')[0];
                    embedUrl = `${this.apiUrl}/tv/${tmdbId}/${episode.season}/${episode.episode}`;
                }
            }
            this.logger.log(`VidSrc embed URL: ${embedUrl}`);
            return [{
                    url: embedUrl,
                    quality: '1080p',
                    isM3U8: false,
                    headers: {
                        'Referer': 'https://vidsrc.to/',
                        'Origin': 'https://vidsrc.to'
                    }
                }];
        }
        catch (error) {
            this.logger.error(`VidSrc scraping failed: ${error.message}`);
            return [];
        }
    }
};
exports.VidSrcScraper = VidSrcScraper;
exports.VidSrcScraper = VidSrcScraper = VidSrcScraper_1 = __decorate([
    (0, common_1.Injectable)()
], VidSrcScraper);
//# sourceMappingURL=vidsrc.scraper.js.map