export interface StreamLink {
    url: string;
    quality?: string;
    isM3U8?: boolean;
    headers?: Record<string, string>;
}
export interface ScraperSearchResult {
    title: string;
    url: string;
    poster?: string;
}
export interface Scraper {
    name: string;
    priority: number;
    search(query: string, tmdbId?: number): Promise<ScraperSearchResult[]>;
    getStreamLinks(url: string, episode?: {
        season: number;
        episode: number;
    }): Promise<StreamLink[]>;
}
export declare const SCRAPER_TOKEN: unique symbol;
