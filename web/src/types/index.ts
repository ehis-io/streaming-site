export interface Content {
    id: number;
    title?: string;
    name?: string;
    poster_path?: string;
    backdrop_path?: string;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
    media_type?: 'movie' | 'tv' | 'anime';
    overview?: string;
    runtime?: number;
    genres?: Genre[];
    // Anime specific properties
    mal_id?: number;
    images?: { jpg: { image_url: string; large_image_url?: string } };
    score?: number;
    aired?: { from: string };
    // TV specific properties
    original_name?: string;
    // Provider specific
    localProviders?: Provider[];
}

export interface Genre {
    id: number;
    name: string;
}

export interface Provider {
    id: string;
    name: string;
    embedUrl: string;
}

export interface StreamLink {
    provider: string;
    url: string;
}
