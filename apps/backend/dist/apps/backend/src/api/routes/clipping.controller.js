"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClippingController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const org_from_request_1 = require("@gitroom/nestjs-libraries/user/org.from.request");
const clipping_service_1 = require("@gitroom/nestjs-libraries/database/prisma/clipping/clipping.service");
const clipping_dto_1 = require("@gitroom/nestjs-libraries/dtos/clipping/clipping.dto");
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
tslib_1.__decorate([
    (0, common_1.Post)('/'),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, clipping_dto_1.ClippingDto]),
    tslib_1.__metadata("design:returntype", void 0)
], ClippingController.prototype, "startClipping", null);
tslib_1.__decorate([
    (0, common_1.Get)('/'),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Query)('page')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Number]),
    tslib_1.__metadata("design:returntype", void 0)
], ClippingController.prototype, "getClippings", null);
tslib_1.__decorate([
    (0, common_1.Get)('/:id'),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", void 0)
], ClippingController.prototype, "getClipping", null);
exports.ClippingController = ClippingController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('Clipping'),
    (0, common_1.Controller)('/clipping'),
    tslib_1.__metadata("design:paramtypes", [clipping_service_1.ClippingService])
], ClippingController);
//# sourceMappingURL=clipping.controller.js.map