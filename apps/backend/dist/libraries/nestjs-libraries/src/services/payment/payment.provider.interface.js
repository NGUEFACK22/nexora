"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProviderAbstract = void 0;
exports.PaymentProvider = PaymentProvider;
const common_1 = require("@nestjs/common");
class PaymentProviderAbstract {
    notSupported() {
        throw new common_1.HttpException(`This action is not supported on ${this.platform}`, 400);
    }
    async syncSubscription(organizationId) {
        return this.notSupported();
    }
    async subscribe(uniqueId, organizationId, userId, body, allowTrial) {
        return this.notSupported();
    }
    async embedded(uniqueId, organizationId, userId, body, allowTrial) {
        return this.notSupported();
    }
    async prorate(organizationId, body) {
        return this.notSupported();
    }
    async setToCancel(organizationId, cancel) {
        return this.notSupported();
    }
    async cancelAllSubscriptions(organizationId) {
        return this.notSupported();
    }
    async portalLink(organizationId) {
        return this.notSupported();
    }
    async getInvoices(organizationId) {
        return this.notSupported();
    }
    async getRenewalDate(organizationId) {
        return { renewsAt: null, trialing: false };
    }
    async checkSubscription(organizationId, subscriptionId) {
        return this.notSupported();
    }
    async getPackages() {
        return this.notSupported();
    }
    async finishTrial(organization) {
        return this.notSupported();
    }
    async checkDiscount(organization) {
        return false;
    }
    async applyDiscount(organization) {
        return this.notSupported();
    }
    async lifetimeDeal(organizationId, code) {
        return this.notSupported();
    }
    async getCharges(organizationId) {
        return this.notSupported();
    }
    async refundCharges(organizationId, chargeIds) {
        return this.notSupported();
    }
    async cancelSubscription(organizationId) {
        return this.notSupported();
    }
    async getCouponInfo(organizationId) {
        return this.notSupported();
    }
    async applyCoupon(organizationId, body) {
        return this.notSupported();
    }
    async cancelCoupon(organizationId) {
        return this.notSupported();
    }
    async chatbaseRefundPreview(organizationId) {
        return this.notSupported();
    }
    async chatbaseRefund(organizationId) {
        return this.notSupported();
    }
    async syncCustomerEmailsAfterSwitch(accounts) { }
}
exports.PaymentProviderAbstract = PaymentProviderAbstract;
function PaymentProvider(params) {
    return function (target) {
        (0, common_1.Injectable)()(target);
        const existingMetadata = Reflect.getMetadata('payment-provider', PaymentProviderAbstract) || [];
        existingMetadata.push({ target, provider: params.provider });
        Reflect.defineMetadata('payment-provider', existingMetadata, PaymentProviderAbstract);
    };
}
//# sourceMappingURL=payment.provider.interface.js.map