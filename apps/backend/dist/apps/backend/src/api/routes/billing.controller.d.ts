import { SubscriptionService } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { Organization, User } from '@prisma/client';
import { BillingSubscribeDto } from '@gitroom/nestjs-libraries/dtos/billing/billing.subscribe.dto';
import { AdminApplyCouponDto } from '@gitroom/nestjs-libraries/dtos/billing/admin.apply.coupon.dto';
import { NotificationService } from '@gitroom/nestjs-libraries/database/prisma/notifications/notification.service';
import { Request } from 'express';
import { UsersService } from '@gitroom/nestjs-libraries/database/prisma/users/users.service';
import { PaymentService } from '@gitroom/nestjs-libraries/services/payment/payment.service';
import { BillingSyncDto } from '@gitroom/nestjs-libraries/dtos/billing/billing.sync.dto';
import { BillingCancelDto } from '@gitroom/nestjs-libraries/dtos/billing/billing.cancel.dto';
export declare class BillingController {
    private _subscriptionService;
    private _notificationService;
    private _usersService;
    private _paymentService;
    constructor(_subscriptionService: SubscriptionService, _notificationService: NotificationService, _usersService: UsersService, _paymentService: PaymentService);
    private provider;
    private assertNoOtherSubscribedAccount;
    checkId(org: Organization, body: string): Promise<{
        status: any;
    }>;
    checkDiscount(org: Organization): Promise<{
        offerCoupon: string | boolean;
    }>;
    applyDiscount(org: Organization): Promise<void>;
    finishTrial(org: Organization): Promise<any>;
    isTrialFinished(org: Organization): Promise<{
        finished: boolean;
    }>;
    embedded(org: Organization, user: User, body: BillingSubscribeDto, req: Request): Promise<any>;
    subscribe(org: Organization, user: User, body: BillingSubscribeDto, req: Request): Promise<any>;
    sync(org: Organization, user: User, body: BillingSyncDto): Promise<{
        active: boolean;
    } | {
        blocked: boolean;
    }>;
    modifyPayment(org: Organization): Promise<{
        portal: string;
    }>;
    getInvoices(org: Organization): Promise<import("@gitroom/nestjs-libraries/services/payment/payment.provider.interface").PaymentInvoice[]>;
    getRenewal(org: Organization): Promise<{
        renewsAt: number | null;
        trialing: boolean;
    }>;
    getCurrentBilling(org: Organization): Promise<{
        platform: import("@gitroom/nestjs-libraries/services/payment/payment.provider.interface").PaymentPlatform;
        provider: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        subscriptionTier: import(".prisma/client").$Enums.SubscriptionTier;
        identifier: string | null;
        cancelAt: Date | null;
        period: import(".prisma/client").$Enums.Period;
        totalChannels: number;
        isLifetime: boolean;
        organizationId: string;
    }>;
    cancel(org: Organization, user: User, body: BillingCancelDto): Promise<any>;
    prorate(org: Organization, body: BillingSubscribeDto): Promise<any>;
    getCharges(user: User, org: Organization): Promise<any>;
    refundCharges(user: User, org: Organization, body: {
        chargeIds: string[];
    }): Promise<any>;
    cancelSubscription(user: User, org: Organization): Promise<any>;
    couponInfo(user: User, org: Organization): Promise<any>;
    applyCoupon(user: User, org: Organization, body: AdminApplyCouponDto): Promise<any>;
    cancelCoupon(user: User, org: Organization): Promise<any>;
    chatbaseRefundPreview(org: Organization): Promise<any>;
    chatbaseRefund(user: User, org: Organization): Promise<{
        refunded: boolean;
        amount?: number;
        currency?: string;
    }>;
    addSubscription(body: {
        subscription: string;
    }, user: User, org: Organization): Promise<void>;
}
