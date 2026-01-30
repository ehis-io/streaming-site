import { Scraper, ScraperSearchResult, StreamLink } from '../scraper.interface';
export declare class SuperStreamScraper implements Scraper {
    name: string;
    priority: number;
    private readonly logger;
    search(query: string): Promise<ScraperSearchResult[]>;
    getStreamLinks(url: string, episode?: {
        season: number;
        episode: number;
    }): Promise<StreamLink[]>;
}
