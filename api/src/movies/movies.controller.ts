import { Controller, Get, Query, Param } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { SearchDto } from './dto/search.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('trending')
  getTrending() {
    return this.moviesService.getTrending();
  }

  @Get('search')
  search(@Query() query: SearchDto) {
    return this.moviesService.search(query.q);
  }

  @Get(':id')
  getDetails(@Param('id') id: string) {
    return this.moviesService.getDetails(+id);
  }
}
