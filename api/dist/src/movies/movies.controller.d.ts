import { MoviesService } from './movies.service';
import { SearchDto } from './dto/search.dto';
export declare class MoviesController {
    private readonly moviesService;
    constructor(moviesService: MoviesService);
    getTrending(): Promise<any>;
    search(query: SearchDto): Promise<any>;
    getDetails(id: string): Promise<any>;
}
