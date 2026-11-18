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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const subscription_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/subscriptions/subscription.service");
const org_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/org.from.request");
const billing_subscribe_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/billing/billing.subscribe.dto");
const admin_apply_coupon_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/billing/admin.apply.coupon.dto");
const swagger_1 = require("@nestjs/swagger");
const user_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/user.from.request");
const notification_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/notifications/notification.service");
const auth_service_1 = require("../../../../../libraries/helpers/src/auth/auth.service");
const users_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/users/users.service");
const payment_service_1 = require("../../../../../libraries/nestjs-libraries/src/services/payment/payment.service");
const billing_sync_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/billing/billing.sync.dto");
const billing_cancel_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/billing/billing.cancel.dto");
const permissions_ability_1 = require("../../services/auth/permissions/permissions.ability");
const permission_exception_class_1 = require("../../services/auth/permissions/permission.exception.class");
const dayjs_1 = __importDefault(require("dayjs"));
let BillingController = class BillingController {
    constructor(_subscriptionService, _notificationService, _usersService, _paymentService) {
        this._subscriptionService = _subscriptionService;
        this._notificationService = _notificationService;
        this._usersService = _usersService;
        this._paymentService = _paymentService;
    }
    provider(org) {
        return this._paymentService.getProviderForOrganization(org.id, 'web');
    }
    async assertNoOtherSubscribedAccount(user) {
        const other = await this._usersService.getUserWithActiveSubscriptionByEmail(user.email, user.id);
        return !!other;
    }
    async checkId(org, body) {
        return {
            status: await (await this.provider(org)).checkSubscription(org.id, body),
        };
    }
    async checkDiscount(org) {
        const offer = await (await this.provider(org)).checkDiscount(org);
        console.log('billing_check_discount', {
            organization_id: org.id,
            offer_coupon: !!offer,
        });
        return {
            offerCoupon: !offer ? false : auth_service_1.AuthService.signJWT({ discount: true }),
        };
    }
    async applyDiscount(org) {
        await (await this.provider(org)).applyDiscount(org);
    }
    async finishTrial(org) {
        const provider = await this.provider(org);
        try {
            const action = await provider.finishTrial(org);
            if (action.requiresAction) {
                return { finish: false, ...action };
            }
            return { finish: true };
        }
        catch (err) {
            console.error('finishTrial failed', err);
            return { finish: false };
        }
    }
    async isTrialFinished(org) {
        return {
            finished: !org.isTrailing,
        };
    }
    async embedded(org, user, body, req) {
        if (await this.assertNoOtherSubscribedAccount(user)) {
            return { blocked: true };
        }
        const uniqueId = req?.cookies?.track;
        return (await this.provider(org)).embedded(uniqueId, org.id, user.id, body, org.allowTrial);
    }
    async subscribe(org, user, body, req) {
        if (await this.assertNoOtherSubscribedAccount(user)) {
            return { blocked: true };
        }
        const uniqueId = req?.cookies?.track;
        return (await this.provider(org)).subscribe(uniqueId, org.id, user.id, body, org.allowTrial);
    }
    async sync(org, user, body) {
        if (await this.assertNoOtherSubscribedAccount(user)) {
            return { blocked: true };
        }
        await this._paymentService.assertCanUseProvider(org.id, body.provider);
        try {
            return await this._paymentService.syncSubscription(body.provider, org.id);
        }
        catch (e) {
            if (e instanceof common_1.HttpException) {
                throw e;
            }
            throw new common_1.HttpException(e?.message || 'Sync failed', 400);
        }
    }
    async modifyPayment(org) {
        const { url } = await (await this.provider(org)).portalLink(org.id);
        return {
            portal: url,
        };
    }
    async getInvoices(org) {
        return (await this.provider(org)).getInvoices(org.id);
    }
    async getRenewal(org) {
        return (await this.provider(org)).getRenewalDate(org.id);
    }
    getCurrentBilling(org) {
        return this._paymentService.getSubscription(org.id);
    }
    async cancel(org, user, body) {
        console.log('billing_cancel_requested', { organization_id: org.id });
        const result = await (await this.provider(org)).setToCancel(org.id, body.cancel);
        console.log('billing_cancel_done', {
            organization_id: org.id,
            cancel_at: result.cancel_at,
        });
        if (!result.unchanged &&
            result.cancel_at &&
            (0, dayjs_1.default)(result.cancel_at).isAfter((0, dayjs_1.default)())) {
            try {
                await this._notificationService.sendEmail(user.email, 'Your Nexora subscription is set to cancel', `Your subscription is pending cancellation and will end on ${(0, dayjs_1.default)(result.cancel_at).format('D MMM, YYYY')} (UTC), the end of your current billing cycle. Until then you can keep using Nexora as usual. Changed your mind? You can reactivate at any time from the <a href="${process.env.FRONTEND_URL}/billing">Billing page</a>.`);
            }
            catch (err) { }
        }
        return result;
    }
    async prorate(org, body) {
        return (await this.provider(org)).prorate(org.id, body);
    }
    async getCharges(user, org) {
        if (!user.isSuperAdmin) {
            throw new common_1.HttpException('Unauthorized', 400);
        }
        return (await this.provider(org)).getCharges(org.id);
    }
    async refundCharges(user, org, body) {
        if (!user.isSuperAdmin) {
            throw new common_1.HttpException('Unauthorized', 400);
        }
        return (await this.provider(org)).refundCharges(org.id, body.chargeIds);
    }
    async cancelSubscription(user, org) {
        if (!user.isSuperAdmin) {
            throw new common_1.HttpException('Unauthorized', 400);
        }
        return (await this.provider(org)).cancelSubscription(org.id);
    }
    async couponInfo(user, org) {
        if (!user.isSuperAdmin) {
            throw new common_1.HttpException('Unauthorized', 400);
        }
        return (await this.provider(org)).getCouponInfo(org.id);
    }
    async applyCoupon(user, org, body) {
        if (!user.isSuperAdmin) {
            throw new common_1.HttpException('Unauthorized', 400);
        }
        return (await this.provider(org)).applyCoupon(org.id, body);
    }
    async cancelCoupon(user, org) {
        if (!user.isSuperAdmin) {
            throw new common_1.HttpException('Unauthorized', 400);
        }
        return (await this.provider(org)).cancelCoupon(org.id);
    }
    async chatbaseRefundPreview(org) {
        return (await this.provider(org)).chatbaseRefundPreview(org.id);
    }
    async chatbaseRefund(user, org) {
        const refund = await (await this.provider(org)).chatbaseRefund(org.id);
        if (refund.refunded) {
            await this._notificationService.sendEmail(process.env.EMAIL_FROM_ADDRESS, 'Refund issued from Chatbase', `Organization ${org.name} received a refund of ${refund.amount} ${refund.currency} and their subscription was cancelled`, user.email);
        }
        return refund;
    }
    async addSubscription(body, user, org) {
        if (!user.isSuperAdmin) {
            throw new Error('Unauthorized');
        }
        await this._subscriptionService.addSubscription(org.id, user.id, body.subscription, this._paymentService.getDefaultProviderName('web'));
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Get)('/check/:id'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "checkId", null);
__decorate([
    (0, common_1.Get)('/check-discount'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "checkDiscount", null);
__decorate([
    (0, common_1.Post)('/apply-discount'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "applyDiscount", null);
__decorate([
    (0, common_1.Post)('/finish-trial'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "finishTrial", null);
__decorate([
    (0, common_1.Get)('/is-trial-finished'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "isTrialFinished", null);
__decorate([
    (0, common_1.Post)('/embedded'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, user_from_request_1.GetUserFromRequest)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, billing_subscribe_dto_1.BillingSubscribeDto, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "embedded", null);
__decorate([
    (0, common_1.Post)('/subscribe'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, user_from_request_1.GetUserFromRequest)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, billing_subscribe_dto_1.BillingSubscribeDto, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "subscribe", null);
__decorate([
    (0, common_1.Post)('/sync'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, user_from_request_1.GetUserFromRequest)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, billing_sync_dto_1.BillingSyncDto]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "sync", null);
__decorate([
    (0, common_1.Get)('/portal'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "modifyPayment", null);
__decorate([
    (0, common_1.Get)('/invoices'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getInvoices", null);
__decorate([
    (0, common_1.Get)('/renewal'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getRenewal", null);
__decorate([
    (0, common_1.Get)('/'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "getCurrentBilling", null);
__decorate([
    (0, common_1.Post)('/cancel'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, user_from_request_1.GetUserFromRequest)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, billing_cancel_dto_1.BillingCancelDto]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)('/prorate'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, billing_subscribe_dto_1.BillingSubscribeDto]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "prorate", null);
__decorate([
    (0, common_1.Get)('/charges'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getCharges", null);
__decorate([
    (0, common_1.Post)('/refund-charges'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "refundCharges", null);
__decorate([
    (0, common_1.Post)('/cancel-subscription'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Get)('/coupon-info'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "couponInfo", null);
__decorate([
    (0, common_1.Post)('/apply-coupon'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, admin_apply_coupon_dto_1.AdminApplyCouponDto]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "applyCoupon", null);
__decorate([
    (0, common_1.Post)('/cancel-coupon'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "cancelCoupon", null);
__decorate([
    (0, common_1.Get)('/chatbase-refund/preview'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "chatbaseRefundPreview", null);
__decorate([
    (0, common_1.Post)('/chatbase-refund'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "chatbaseRefund", null);
__decorate([
    (0, common_1.Post)('/add-subscription'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_from_request_1.GetUserFromRequest)()),
    __param(2, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "addSubscription", null);
exports.BillingController = BillingController = __decorate([
    (0, swagger_1.ApiTags)('Billing'),
    (0, common_1.Controller)('/billing'),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService,
        notification_service_1.NotificationService,
        users_service_1.UsersService,
        payment_service_1.PaymentService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map