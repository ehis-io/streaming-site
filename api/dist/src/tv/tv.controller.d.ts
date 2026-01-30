import { TvService } from './tv.service';
declare class SearchDto {
    q: string;
}
export declare class TvController {
    private readonly tvService;
    constructor(tvService: TvService);
    getTrending(): Promise<any>;
    search(query: SearchDto): Promise<any>;
    getDetails(id: string): Promise<any>;
}
export {};
