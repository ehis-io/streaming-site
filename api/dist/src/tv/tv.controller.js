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
exports.TvController = void 0;
const common_1 = require("@nestjs/common");
const tv_service_1 = require("./tv.service");
const class_validator_1 = require("class-validator");
class SearchDto {
    q;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SearchDto.prototype, "q", void 0);
let TvController = class TvController {
    tvService;
    constructor(tvService) {
        this.tvService = tvService;
    }
    getTrending() {
        return this.tvService.getTrending();
    }
    search(query) {
        return this.tvService.search(query.q);
    }
    getDetails(id) {
        return this.tvService.getDetails(+id);
    }
};
exports.TvController = TvController;
__decorate([
    (0, common_1.Get)('trending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TvController.prototype, "getTrending", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SearchDto]),
    __metadata("design:returntype", void 0)
], TvController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TvController.prototype, "getDetails", null);
exports.TvController = TvController = __decorate([
    (0, common_1.Controller)('tv'),
    __metadata("design:paramtypes", [tv_service_1.TvService])
], TvController);
//# sourceMappingURL=tv.controller.js.map