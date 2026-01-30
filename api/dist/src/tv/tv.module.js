"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TvModule = void 0;
const common_1 = require("@nestjs/common");
const tv_controller_1 = require("./tv.controller");
const tv_service_1 = require("./tv.service");
const tmdb_module_1 = require("../tmdb/tmdb.module");
const prisma_module_1 = require("../prisma/prisma.module");
let TvModule = class TvModule {
};
exports.TvModule = TvModule;
exports.TvModule = TvModule = __decorate([
    (0, common_1.Module)({
        imports: [tmdb_module_1.TmdbModule, prisma_module_1.PrismaModule],
        controllers: [tv_controller_1.TvController],
        providers: [tv_service_1.TvService],
    })
], TvModule);
//# sourceMappingURL=tv.module.js.map