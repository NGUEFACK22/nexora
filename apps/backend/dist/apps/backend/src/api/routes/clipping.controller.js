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
exports.ClippingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const org_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/org.from.request");
const clipping_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/clipping/clipping.service");
const clipping_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/clipping/clipping.dto");
let ClippingController = class ClippingController {
    constructor(_clippingService) {
        this._clippingService = _clippingService;
    }
    startClipping(org, body) {
        return this._clippingService.startClipping(org, body);
    }
    getClippings(org, page) {
        return this._clippingService.getClippings(org.id, page);
    }
    getClipping(org, id) {
        return this._clippingService.getClipping(org.id, id);
    }
};
exports.ClippingController = ClippingController;
__decorate([
    (0, common_1.Post)('/'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, clipping_dto_1.ClippingDto]),
    __metadata("design:returntype", void 0)
], ClippingController.prototype, "startClipping", null);
__decorate([
    (0, common_1.Get)('/'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], ClippingController.prototype, "getClippings", null);
__decorate([
    (0, common_1.Get)('/:id'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ClippingController.prototype, "getClipping", null);
exports.ClippingController = ClippingController = __decorate([
    (0, swagger_1.ApiTags)('Clipping'),
    (0, common_1.Controller)('/clipping'),
    __metadata("design:paramtypes", [clipping_service_1.ClippingService])
], ClippingController);
//# sourceMappingURL=clipping.controller.js.map