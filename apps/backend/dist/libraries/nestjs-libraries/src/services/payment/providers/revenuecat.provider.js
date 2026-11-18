"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueCatProvider = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const lodash_1 = require("lodash");
const payment_provider_interface_1 = require("@gitroom/nestjs-libraries/services/payment/payment.provider.interface");
const subscription_service_1 = require("@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service");
const organization_service_1 = require("@gitroom/nestjs-libraries/database/prisma/organizations/organization.service");
const pricing_1 = require("@gitroom/nestjs-libraries/database/prisma/subscriptions/pricing");
const payment_providers_1 = require("@gitroom/nestjs-libraries/services/payment/payment.providers");
let RevenueCatProvider = class RevenueCatProvider extends payment_provider_interface_1.PaymentProviderAbstract {
    constructor(_subscriptionService, _organizationService) {
        super();
        this._subscriptionService = _subscriptionService;
        this._organizationService = _organizationService;
        this.platform = 'mobile';
    }
    validateWebhook(rawBody, headers) {
        const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
        if (!secret || headers.authorization !== secret) {
            throw new common_1.HttpException('Invalid webhook authorization', 401);
        }
        return JSON.parse(rawBody.toString('utf8'));
    }
    async processWebhook(body) {
        const event = body?.event;
        if (!event || event.type === 'TEST') {
            return { ok: true };
        }
        const organizations = (0, lodash_1.uniq)([
            event.app_user_id,
            event.original_app_user_id,
            event.transferred_from,
            event.transferred_to,
        ]
            .flat()
            .filter((p) => p && !p.startsWith('$RCAnonymousID:')));
        for (const organizationId of organizations) {
            await this.syncSubscription(organizationId);
        }
        return { ok: true };
    }
    async cancelAllSubscriptions(organizationId) {
        return;
    }
    async syncSubscription(organizationId) {
        const organization = await this._organizationService.getOrgById(organizationId);
        if (!organization) {
            return { active: false };
        }
        const active = await this.getActiveSubscription(organizationId);
        if (!active) {
            await this._subscriptionService.deleteSubscriptionByOrgId(organizationId, payment_providers_1.REVENUECAT_PROVIDER);
            return { active: false };
        }
        const { billing, period } = this.parseProductId(active.productId);
        await this._subscriptionService.createOrUpdateSubscriptionByOrg(active.subscription.period_type === 'trial', organizationId, payment_providers_1.REVENUECAT_PROVIDER, active.productId, pricing_1.pricing[billing].channel, billing, period, active.subscription.unsubscribe_detected_at &&
            active.subscription.expires_date
            ? (0, dayjs_1.default)(active.subscription.expires_date).unix()
            : null);
        return { active: true };
    }
    async getActiveSubscription(organizationId) {
        if (!process.env.REVENUECAT_SECRET_KEY) {
            throw new common_1.HttpException('RevenueCat is not configured', 400);
        }
        const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(organizationId)}`, {
            headers: {
                Authorization: `Bearer ${process.env.REVENUECAT_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new common_1.HttpException(`RevenueCat subscriber request failed (${response.status})`, 500);
        }
        const { subscriber } = await response.json();
        const subscriptions = subscriber?.subscriptions || {};
        const rejectSandbox = !!process.env.IN_APP_PURCHASE_REJECT_SANDBOX;
        return Object.entries(subscriptions)
            .map(([productId, subscription]) => ({ productId, subscription }))
            .filter(({ subscription }) => (!rejectSandbox || !subscription.is_sandbox) &&
            (!subscription.expires_date ||
                (0, dayjs_1.default)(subscription.expires_date).isAfter((0, dayjs_1.default)())))
            .sort((a, b) => (0, dayjs_1.default)(b.subscription.expires_date || '2999-01-01').diff((0, dayjs_1.default)(a.subscription.expires_date || '2999-01-01')))[0];
    }
    parseProductId(productId) {
        const parts = productId.split(/[._]/);
        const period = (parts.pop() || '').toUpperCase();
        const billing = (parts.pop() || '').toUpperCase();
        if (!['MONTHLY', 'YEARLY'].includes(period) ||
            !['STANDARD', 'TEAM', 'PRO', 'ULTIMATE'].includes(billing)) {
            throw new common_1.HttpException(`Unknown RevenueCat product identifier: ${productId}`, 400);
        }
        return {
            billing: billing,
            period: period,
        };
    }
};
exports.RevenueCatProvider = RevenueCatProvider;
exports.RevenueCatProvider = RevenueCatProvider = tslib_1.__decorate([
    (0, payment_provider_interface_1.PaymentProvider)({ provider: payment_providers_1.REVENUECAT_PROVIDER }),
    tslib_1.__metadata("design:paramtypes", [subscription_service_1.SubscriptionService,
        organization_service_1.OrganizationService])
], RevenueCatProvider);
//# sourceMappingURL=revenuecat.provider.js.map