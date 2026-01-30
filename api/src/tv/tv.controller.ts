import { Controller, Get, Query, Param } from '@nestjs/common';
import { TvService } from './tv.service';
import { IsString, IsNotEmpty } from 'class-validator';

class SearchDto {
  @IsString()
  @IsNotEmpty()
  q: string;
}

@Controller('tv')
export class TvController {
  constructor(private readonly tvService: TvService) {}

  @Get('trending')
  getTrending() {
    return this.tvService.getTrending();
  }

  @Get('search')
  search(@Query() query: SearchDto) {
    return this.tvService.search(query.q);
  }

  @Get(':id')
  getDetails(@Param('id') id: string) {
    return this.tvService.getDetails(+id);
  }
}
