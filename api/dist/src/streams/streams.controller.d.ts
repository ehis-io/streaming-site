import { ProvidersService } from '../providers/providers.service';
import { GetStreamsDto } from './dto/get-streams.dto';
export declare class StreamsController {
    private readonly providersService;
    constructor(providersService: ProvidersService);
    getStreams(id: string, query: GetStreamsDto): Promise<import("../providers/scraper.interface").StreamLink[]>;
    getStreamsNested(id: string, season: string, episode: string): Promise<import("../providers/scraper.interface").StreamLink[]>;
}
