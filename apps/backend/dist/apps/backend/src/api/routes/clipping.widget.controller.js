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
exports.ClippingWidgetController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const org_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/org.from.request");
const clipping_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/clipping/clipping.service");
let ClippingWidgetController = class ClippingWidgetController {
    constructor(_clippingService) {
        this._clippingService = _clippingService;
    }
    status(org, req, seen) {
        return this._clippingService.getWidgetProgress(org.id, req.clippingId, !!seen);
    }
};
exports.ClippingWidgetController = ClippingWidgetController;
__decorate([
    (0, common_1.Get)('/status'),
    (0, common_1.Header)('Cache-Control', 'no-store'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('seen')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], ClippingWidgetController.prototype, "status", null);
exports.ClippingWidgetController = ClippingWidgetController = __decorate([
    (0, swagger_1.ApiTags)('Clipping'),
    (0, common_1.Controller)('/clipping-widget'),
    __metadata("design:paramtypes", [clipping_service_1.ClippingService])
], ClippingWidgetController);
//# sourceMappingURL=clipping.widget.controller.js.map