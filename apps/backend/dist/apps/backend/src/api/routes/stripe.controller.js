"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payment_service_1 = require("@gitroom/nestjs-libraries/services/payment/payment.service");
let StripeController = class StripeController {
    constructor(_paymentService) {
        this._paymentService = _paymentService;
    }
    async stripe(req) {
        return await this._paymentService.webhook('stripe', req.rawBody, req.headers);
    }
};
exports.StripeController = StripeController;
tslib_1.__decorate([
    (0, common_1.Post)('/'),
    tslib_1.__param(0, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], StripeController.prototype, "stripe", null);
exports.StripeController = StripeController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('Stripe'),
    (0, common_1.Controller)('/stripe'),
    tslib_1.__metadata("design:paramtypes", [payment_service_1.PaymentService])
], StripeController);
//# sourceMappingURL=stripe.controller.js.map