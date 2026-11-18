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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProviderManager = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const payment_provider_interface_1 = require("./payment.provider.interface");
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
exports.PaymentProviderManager = PaymentProviderManager = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModuleRef])
], PaymentProviderManager);
//# sourceMappingURL=payment.provider.manager.js.map