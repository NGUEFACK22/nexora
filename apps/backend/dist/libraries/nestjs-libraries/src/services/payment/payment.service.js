"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const payment_provider_manager_1 = require("@gitroom/nestjs-libraries/services/payment/payment.provider.manager");
const subscription_service_1 = require("@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service");
let PaymentService = class PaymentService {
    constructor(_paymentProviderManager, _subscriptionService) {
        this._paymentProviderManager = _paymentProviderManager;
        this._subscriptionService = _subscriptionService;
    }
    async webhook(provider, rawBody, headers) {
        const paymentProvider = this._paymentProviderManager.getProvider(provider);
        const event = await paymentProvider.validateWebhook(rawBody, headers);
        return paymentProvider.processWebhook(event);
    }
    syncSubscription(provider, organizationId) {
        return this._paymentProviderManager
            .getProvider(provider)
            .syncSubscription(organizationId);
    }
    getDefaultProvider(platform) {
        return this._paymentProviderManager.getDefaultProvider(platform).provider;
    }
    getDefaultProviderName(platform) {
        return this._paymentProviderManager.getDefaultProvider(platform).name;
    }
    async getSubscription(organizationId) {
        const subscription = await this._subscriptionService.getSubscriptionByOrganizationId(organizationId);
        if (!subscription) {
            return null;
        }
        let platform;
        try {
            platform = this._paymentProviderManager.getProvider(subscription.provider).platform;
        }
        catch (err) {
            platform = undefined;
        }
        return {
            ...subscription,
            platform,
        };
    }
    async getProviderForOrganization(organizationId, platform) {
        const subscription = await this._subscriptionService.getSubscriptionByOrganizationId(organizationId);
        if (!subscription) {
            return this._paymentProviderManager.getDefaultProvider(platform).provider;
        }
        const current = this._paymentProviderManager.getProvider(subscription.provider);
        if (current.platform !== platform) {
            throw new common_1.HttpException(`Your subscription is managed on ${current.platform}, please use ${current.platform} to manage it`, 400);
        }
        return current;
    }
    async assertCanUseProvider(organizationId, provider) {
        const subscription = await this._subscriptionService.getSubscriptionByOrganizationId(organizationId);
        if (!subscription || subscription.provider === provider) {
            return;
        }
        const current = this._paymentProviderManager.getProvider(subscription.provider);
        const requested = this._paymentProviderManager.getProvider(provider);
        throw new common_1.HttpException(current.platform !== requested.platform
            ? `Your subscription is managed on ${current.platform}, please use ${current.platform} to manage it`
            : `Your subscription is managed by ${subscription.provider}`, 400);
    }
    async cancelAllSubscriptions(organizationId) {
        const subscription = await this._subscriptionService.getSubscriptionByOrganizationId(organizationId);
        if (subscription) {
            return this._paymentProviderManager
                .getProvider(subscription.provider)
                .cancelAllSubscriptions(organizationId);
        }
        for (const { provider } of this._paymentProviderManager.getProviders()) {
            await provider.cancelAllSubscriptions(organizationId);
        }
    }
    async syncCustomerEmailsAfterSwitch(accounts) {
        for (const { provider } of this._paymentProviderManager.getProviders()) {
            await provider.syncCustomerEmailsAfterSwitch(accounts);
        }
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [payment_provider_manager_1.PaymentProviderManager,
        subscription_service_1.SubscriptionService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map