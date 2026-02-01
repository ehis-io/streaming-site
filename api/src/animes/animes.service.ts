import { Injectable } from '@nestjs/common';
import { MALService } from '../mal/mal.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnimesService {
    constructor(
        private malService: MALService,
        private prismaService: PrismaService,
    ) { }

    async getTrending(page: number = 1) {
        const data = await this.malService.getTrending(page);
        if (data && (data as any).data) {
            (data as any).data = (data as any).data.map((item: any) => ({
                ...item,
                synopsis: this.cleanSynopsis(item.synopsis),
            }));
        }
        return data;
    }

    async search(query: string, page: number = 1) {
        const data = await this.malService.search(query, page);
        if (data && (data as any).data) {
            (data as any).data = (data as any).data.map((item: any) => ({
                ...item,
                synopsis: this.cleanSynopsis(item.synopsis),
            }));
        }
        return data;
    }

    async getDetails(id: number) {
        const malData = await this.malService.getDetails(id);
        const dbData = await this.prismaService.anime.findUnique({
            where: { malId: id },
            include: { providers: true },
        });

        // Clean synopsis in details
        const cleanedMalData = malData && (malData as any).data ? {
            ...malData,
            data: {
                ...(malData as any).data,
                synopsis: this.cleanSynopsis((malData as any).data.synopsis),
            }
        } : malData;

        return {
            ...cleanedMalData,
            localProviders: dbData?.providers || [],
        };
    }

    private cleanSynopsis(synopsis: string): string {
        if (!synopsis) return synopsis;
        return synopsis
            .replace(/\(Source:.*?\)/gi, '')
            .replace(/\[Written by.*?\]/gi, '')
            .trim();
    }

    async getGenres() {
        return this.malService.getGenres();
    }

    async getRecommendations(id: number) {
        return this.malService.getRecommendations(id);
    }
}
