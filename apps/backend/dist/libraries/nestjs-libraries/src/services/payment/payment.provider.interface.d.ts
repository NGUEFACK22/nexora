import { Organization } from '@prisma/client';
import { BillingSubscribeDto } from '@gitroom/nestjs-libraries/dtos/billing/billing.subscribe.dto';
import { AdminApplyCouponDto } from '@gitroom/nestjs-libraries/dtos/billing/admin.apply.coupon.dto';
export type PaymentPlatform = 'web' | 'mobile';
export interface PaymentInvoice {
    id: string;
    number: string | null;
    tier: string | null;
    period: string | null;
    description: string | null;
    amount: number;
    currency: string;
    created: number;
    periodEnd: number;
    status: 'paid' | 'pending' | 'failed' | 'void';
    downloadUrl: string | null;
    viewUrl: string | null;
}
export declare abstract class PaymentProviderAbstract {
    abstract platform: PaymentPlatform;
    abstract validateWebhook(rawBody: Buffer, headers: Record<string, string | string[] | undefined>): Promise<any> | any;
    abstract processWebhook(event: any): Promise<any>;
    protected notSupported(): never;
    syncSubscription(organizationId: string): Promise<{
        active: boolean;
    }>;
    subscribe(uniqueId: string, organizationId: string, userId: string, body: BillingSubscribeDto, allowTrial: boolean): Promise<any>;
    embedded(uniqueId: string, organizationId: string, userId: string, body: BillingSubscribeDto, allowTrial: boolean): Promise<any>;
    prorate(organizationId: string, body: BillingSubscribeDto): Promise<any>;
    setToCancel(organizationId: string, cancel?: boolean): Promise<any>;
    cancelAllSubscriptions(organizationId: string): Promise<any>;
    portalLink(organizationId: string): Promise<{
        url: string;
    }>;
    getInvoices(organizationId: string): Promise<PaymentInvoice[]>;
    getRenewalDate(organizationId: string): Promise<{
        renewsAt: number | null;
        trialing: boolean;
    }>;
    checkSubscription(organizationId: string, subscriptionId: string): Promise<any>;
    getPackages(): Promise<any>;
    finishTrial(organization: Organization): Promise<any>;
    checkDiscount(organization: Organization): Promise<boolean>;
    applyDiscount(organization: Organization): Promise<any>;
    lifetimeDeal(organizationId: string, code: string): Promise<any>;
    getCharges(organizationId: string): Promise<any>;
    refundCharges(organizationId: string, chargeIds: string[]): Promise<any>;
    cancelSubscription(organizationId: string): Promise<any>;
    getCouponInfo(organizationId: string): Promise<any>;
    applyCoupon(organizationId: string, body: AdminApplyCouponDto): Promise<any>;
    cancelCoupon(organizationId: string): Promise<any>;
    chatbaseRefundPreview(organizationId: string): Promise<any>;
    chatbaseRefund(organizationId: string): Promise<{
        refunded: boolean;
        amount?: number;
        currency?: string;
    }>;
    syncCustomerEmailsAfterSwitch(accounts: {
        id: string;
        email: string;
    }[]): Promise<void>;
}
export interface PaymentProviderParams {
    provider: string;
}
export declare function PaymentProvider(params: PaymentProviderParams): (target: any) => void;
