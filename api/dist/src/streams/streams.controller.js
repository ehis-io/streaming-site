"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamsController = void 0;
const common_1 = require("@nestjs/common");
const providers_service_1 = require("../providers/providers.service");
const get_streams_dto_1 = require("./dto/get-streams.dto");
let StreamsController = class StreamsController {
    providersService;
    constructor(providersService) {
        this.providersService = providersService;
    }
    async getStreams(id, query) {
        return this.providersService.findStreamLinks(id, query.season, query.episode);
    }
    async getStreamsNested(id, season, episode) {
        return this.providersService.findStreamLinks(id, parseInt(season), parseInt(episode));
    }
};
exports.StreamsController = StreamsController;
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, get_streams_dto_1.GetStreamsDto]),
    __metadata("design:returntype", Promise)
], StreamsController.prototype, "getStreams", null);
__decorate([
    (0, common_1.Get)(':id/:season/:episode'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('season')),
    __param(2, (0, common_1.Param)('episode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], StreamsController.prototype, "getStreamsNested", null);
exports.StreamsController = StreamsController = __decorate([
    (0, common_1.Controller)('streams'),
    __metadata("design:paramtypes", [providers_service_1.ProvidersService])
], StreamsController);
//# sourceMappingURL=streams.controller.js.map