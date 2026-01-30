import { Module } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { SimpleScraper } from './scrapers/simple.scraper';
import { VidSrcScraper } from './scrapers/vidsrc.scraper';
import { SuperStreamScraper } from './scrapers/superstream.scraper';
import { TmdbModule } from '../tmdb/tmdb.module';
import { SCRAPER_TOKEN } from './scraper.interface';

@Module({
  imports: [TmdbModule],
  providers: [
    ProvidersService,
    SimpleScraper,
    VidSrcScraper,
    SuperStreamScraper,
    {
      provide: SCRAPER_TOKEN,
      useFactory: (simple: SimpleScraper, vidsrc: VidSrcScraper, superstream: SuperStreamScraper) => {
        return [simple, vidsrc, superstream];
      },
      inject: [SimpleScraper, VidSrcScraper, SuperStreamScraper],
    },
  ],
  exports: [ProvidersService],
})
export class ProvidersModule {}
