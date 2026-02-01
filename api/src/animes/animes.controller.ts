import { Controller, Get, Query, Param } from '@nestjs/common';
import { AnimesService } from './animes.service';
import { SearchDto } from './dto/search.dto';

@Controller('animes')
export class AnimesController {
    constructor(private readonly animesService: AnimesService) { }

    @Get('trending')
    getTrending(@Query('page') page: string) {
        return this.animesService.getTrending(page ? +page : 1);
    }

    @Get('search')
    search(@Query() query: SearchDto, @Query('page') page: string) {
        return this.animesService.search(query.q, page ? +page : 1);
    }

    @Get('genres')
    getGenres() {
        return this.animesService.getGenres();
    }

    @Get(':id/recommendations')
    getRecommendations(@Param('id') id: string) {
        return this.animesService.getRecommendations(+id);
    }

    @Get(':id')
    getDetails(@Param('id') id: string) {
        return this.animesService.getDetails(+id);
    }
}
