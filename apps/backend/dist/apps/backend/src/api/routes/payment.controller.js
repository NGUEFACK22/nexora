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
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payment_service_1 = require("../../../../../libraries/nestjs-libraries/src/services/payment/payment.service");
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
__decorate([
    (0, common_1.Post)('/:provider'),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "webhook", null);
exports.PaymentController = PaymentController = __decorate([
    (0, swagger_1.ApiTags)('Payment'),
    (0, common_1.Controller)('/payment'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map