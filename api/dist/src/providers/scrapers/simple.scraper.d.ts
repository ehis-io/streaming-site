import { Scraper, ScraperSearchResult, StreamLink } from '../scraper.interface';
export declare class SimpleScraper implements Scraper {
    name: string;
    priority: number;
    private readonly logger;
    private providers;
    search(query: string, tmdbId?: number): Promise<ScraperSearchResult[]>;
    getStreamLinks(url: string, episode?: {
        season: number;
        episode: number;
    }): Promise<StreamLink[]>;
}
