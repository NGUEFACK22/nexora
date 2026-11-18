"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProviderManager = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const payment_provider_interface_1 = require("@gitroom/nestjs-libraries/services/payment/payment.provider.interface");
let PaymentProviderManager = class PaymentProviderManager {
    constructor(_moduleRef) {
        this._moduleRef = _moduleRef;
    }
    metadata() {
        return (Reflect.getMetadata('payment-provider', payment_provider_interface_1.PaymentProviderAbstract) || []);
    }
    getProvider(provider) {
        const found = this.metadata().find((m) => m.provider === provider);
        if (!found) {
            throw new common_1.HttpException(`Payment provider ${provider} not found`, 400);
        }
        return this._moduleRef.get(found.target, { strict: false });
    }
    getProviders() {
        return this.metadata().map((m) => ({
            name: m.provider,
            provider: this._moduleRef.get(m.target, { strict: false }),
        }));
    }
    getDefaultProvider(platform) {
        const found = this.getProviders().find((p) => p.provider.platform === platform);
        if (!found) {
            throw new Error(`No payment provider registered for ${platform}`);
        }
        return found;
    }
};
exports.PaymentProviderManager = PaymentProviderManager;
exports.PaymentProviderManager = PaymentProviderManager = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [core_1.ModuleRef])
], PaymentProviderManager);
//# sourceMappingURL=payment.provider.manager.js.map