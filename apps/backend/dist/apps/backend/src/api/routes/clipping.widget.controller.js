"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClippingWidgetController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const org_from_request_1 = require("@gitroom/nestjs-libraries/user/org.from.request");
const clipping_service_1 = require("@gitroom/nestjs-libraries/database/prisma/clipping/clipping.service");
let ClippingWidgetController = class ClippingWidgetController {
    constructor(_clippingService) {
        this._clippingService = _clippingService;
    }
    status(org, req, seen) {
        return this._clippingService.getWidgetProgress(org.id, req.clippingId, !!seen);
    }
};
exports.ClippingWidgetController = ClippingWidgetController;
tslib_1.__decorate([
    (0, common_1.Get)('/status'),
    (0, common_1.Header)('Cache-Control', 'no-store'),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__param(2, (0, common_1.Query)('seen')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, String]),
    tslib_1.__metadata("design:returntype", void 0)
], ClippingWidgetController.prototype, "status", null);
exports.ClippingWidgetController = ClippingWidgetController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('Clipping'),
    (0, common_1.Controller)('/clipping-widget'),
    tslib_1.__metadata("design:paramtypes", [clipping_service_1.ClippingService])
], ClippingWidgetController);
//# sourceMappingURL=clipping.widget.controller.js.map