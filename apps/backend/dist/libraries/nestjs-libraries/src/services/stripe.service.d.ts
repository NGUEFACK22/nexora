import Stripe from 'stripe';
import { Organization } from '@prisma/client';
import { SubscriptionService } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { BillingSubscribeDto } from '@gitroom/nestjs-libraries/dtos/billing/billing.subscribe.dto';
import { TrackService } from '@gitroom/nestjs-libraries/track/track.service';
import { UsersService } from '@gitroom/nestjs-libraries/database/prisma/users/users.service';
import { PaymentInvoice, PaymentPlatform, PaymentProviderAbstract } from '@gitroom/nestjs-libraries/services/payment/payment.provider.interface';
export declare class StripeService extends PaymentProviderAbstract {
    private _subscriptionService;
    private _organizationService;
    private _userService;
    private _trackService;
    platform: PaymentPlatform;
    constructor(_subscriptionService: SubscriptionService, _organizationService: OrganizationService, _userService: UsersService, _trackService: TrackService);
    validateRequest(rawBody: Buffer, signature: string, endpointSecret: string): Stripe.Event;
    validateWebhook(rawBody: Buffer, headers: Record<string, string | string[] | undefined>): Stripe.Event;
    processWebhook(event: Stripe.Event): Promise<void | {}>;
    checkValidCard(event: Stripe.CustomerSubscriptionCreatedEvent | Stripe.CustomerSubscriptionUpdatedEvent): Promise<boolean>;
    createSubscription(event: Stripe.CustomerSubscriptionCreatedEvent): Promise<void | {}>;
    updateSubscription(event: Stripe.CustomerSubscriptionUpdatedEvent): Promise<void | {}>;
    deleteSubscription(event: Stripe.CustomerSubscriptionDeletedEvent): Promise<void | {}>;
    private getInvoicePaymentIntents;
    private keepCardOfUnpaidInvoices;
    syncCustomerEmailsAfterSwitch(accounts: {
        id: string;
        email: string;
    }[]): Promise<void>;
    createOrGetCustomer(organization: Organization): Promise<string>;
    getPackages(): Promise<{
        [x: string]: {
            name: string;
            recurring: Stripe.Price.Recurring.Interval;
            price: number;
        }[];
    }>;
    prorate(organizationId: string, body: BillingSubscribeDto): Promise<{
        price: number;
    }>;
    getCustomerSubscriptions(organizationId: string): Promise<Stripe.Response<Stripe.ApiList<Stripe.Subscription>>>;
    private getLiveSubscriptions;
    setToCancel(organizationId: string, cancel?: boolean): Promise<{
        id: string;
        cancel_at: Date;
        unchanged: boolean;
    } | {
        id: string;
        cancel_at: Date;
        unchanged?: undefined;
    }>;
    cancelAllSubscriptions(organizationId: string): Promise<void>;
    getCustomerByOrganizationId(organizationId: string): Promise<string>;
    createBillingPortalLink(customer: string): Promise<Stripe.Response<Stripe.BillingPortal.Session>>;
    private findAutoApplyPromotionCode;
    private createEmbeddedCheckout;
    private createCheckoutSession;
    portalLink(organizationId: string): Promise<Stripe.Response<Stripe.BillingPortal.Session>>;
    getRenewalDate(organizationId: string): Promise<{
        renewsAt: number;
        trialing: boolean;
    }>;
    getInvoices(organizationId: string): Promise<PaymentInvoice[]>;
    finishTrial(organization: Organization): Promise<{
        requiresAction: boolean;
        clientSecret: string;
    } | {
        requiresAction: boolean;
        clientSecret?: undefined;
    }>;
    private getRequiredActionFromSubscription;
    checkDiscount(organization: Organization): Promise<boolean>;
    applyDiscount(organization: Organization): Promise<boolean>;
    checkSubscription(organizationId: string, subscriptionId: string): Promise<0 | 1 | 2>;
    embedded(uniqueId: string, organizationId: string, userId: string, body: BillingSubscribeDto, allowTrial: boolean): Promise<{
        auto_apply_coupon?: string;
        client_secret: string;
    } | {
        blocked: boolean;
    }>;
    subscribe(uniqueId: string, organizationId: string, userId: string, body: BillingSubscribeDto, allowTrial: boolean): Promise<{
        url: string;
    } | {
        requiresAction: boolean;
        clientSecret: string;
        id: string;
        portal?: undefined;
    } | {
        requiresAction: boolean;
        clientSecret?: undefined;
        id: string;
        portal?: undefined;
    } | {
        id: string;
        portal?: undefined;
    } | {
        portal: string;
        id?: undefined;
    }>;
    paymentSucceeded(event: Stripe.InvoicePaymentSucceededEvent): Promise<{
        ok: boolean;
    }>;
    private resubscribeOnLatePayment;
    private getCardKeptByInvoice;
    private voidUnpaidInvoices;
    private trackConversion;
    private trackSubscription;
    getCharges(organizationId: string): Promise<{
        disputed: boolean;
        invoice_pdf: string;
        id: string;
        amount: number;
        currency: string;
        created: number;
        status: Stripe.Charge.Status;
        refunded: boolean;
        amount_refunded: number;
        description: string;
        receipt_url: string;
        invoice: any;
    }[]>;
    private hasUnresolvedDispute;
    refundCharges(organizationId: string, chargeIds: string[]): Promise<{
        refunded: string[];
        failed: string[];
        reason: string;
    }>;
    cancelSubscription(organizationId: string): Promise<{
        cancelled: boolean;
    }>;
    private mapSubscriptionDiscounts;
    private getActiveStripeSubscription;
    getCouponInfo(organizationId: string): Promise<{
        tier: import(".prisma/client").$Enums.SubscriptionTier;
        period: import(".prisma/client").$Enums.Period;
        isLifetime: boolean;
        monthlyPrice: number;
        planPrice: number;
        nextPayment: number;
        coupons: {
            type: string;
            value: number;
            duration: Stripe.Coupon.Duration;
            durationInMonths: number;
            remainingMonths: number;
        }[];
        supported: boolean;
    }>;
    applyCoupon(organizationId: string, body: {
        type: string;
        value: number;
        months: number;
    }): Promise<{
        applied: boolean;
        reason: string;
    } | {
        applied: boolean;
        reason?: undefined;
    }>;
    cancelCoupon(organizationId: string): Promise<{
        cancelled: boolean;
        reason: string;
    } | {
        cancelled: boolean;
        reason?: undefined;
    }>;
    chatbaseRefundPreview(organizationId: string): Promise<{
        eligible: false;
        reason: string;
        chargeId?: undefined;
        amount?: undefined;
        currency?: undefined;
        tier?: undefined;
        period?: undefined;
        subscriptionIds?: undefined;
    } | {
        eligible: true;
        chargeId: string;
        amount: number;
        currency: string;
        tier: import(".prisma/client").$Enums.SubscriptionTier;
        period: import(".prisma/client").$Enums.Period;
        subscriptionIds: string[];
        reason?: undefined;
    }>;
    chatbaseRefund(organizationId: string): Promise<{
        refunded: boolean;
        reason: string;
        amount?: undefined;
        currency?: undefined;
        subscriptionCancelled?: undefined;
    } | {
        refunded: boolean;
        amount: number;
        currency: string;
        subscriptionCancelled: boolean;
        reason?: undefined;
    }>;
    lifetimeDeal(organizationId: string, code: string): Promise<{
        success: boolean;
    }>;
}
