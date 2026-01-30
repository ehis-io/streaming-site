import { TmdbService } from '../tmdb/tmdb.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class MoviesService {
    private tmdbService;
    private prismaService;
    constructor(tmdbService: TmdbService, prismaService: PrismaService);
    getTrending(): Promise<any>;
    search(query: string): Promise<any>;
    getDetails(id: number): Promise<any>;
}
