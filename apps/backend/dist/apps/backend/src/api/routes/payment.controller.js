"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payment_service_1 = require("@gitroom/nestjs-libraries/services/payment/payment.service");
let PaymentController = class PaymentController {
    constructor(_paymentService) {
        this._paymentService = _paymentService;
    }
    async webhook(provider, req) {
        try {
            return await this._paymentService.webhook(provider, req.rawBody, req.headers);
        }
        catch (e) {
            if (e instanceof common_1.HttpException) {
                throw e;
            }
            throw new common_1.HttpException(e, 500);
        }
    }
};
exports.PaymentController = PaymentController;
tslib_1.__decorate([
    (0, common_1.Post)('/:provider'),
    tslib_1.__param(0, (0, common_1.Param)('provider')),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PaymentController.prototype, "webhook", null);
exports.PaymentController = PaymentController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('Payment'),
    (0, common_1.Controller)('/payment'),
    tslib_1.__metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map