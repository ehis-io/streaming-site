import { Injectable } from '@nestjs/common';
import { TmdbService } from '../tmdb/tmdb.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TvService {
  constructor(
    private tmdbService: TmdbService,
    private prismaService: PrismaService,
  ) {}

  async getTrending() {
    return this.tmdbService.getTrending('tv');
  }

  async search(query: string) {
    return this.tmdbService.search(query, 'tv');
  }

  async getDetails(id: number) {
    const tmdbData = await this.tmdbService.getDetails(id, 'tv');
    const dbData = await this.prismaService.movie.findUnique({
      where: { tmdbId: id },
      include: { providers: true },
    });

    return {
      ...tmdbData,
      localProviders: dbData?.providers || [],
    };
  }
}
