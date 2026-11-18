import { PaymentProviderManager } from '@gitroom/nestjs-libraries/services/payment/payment.provider.manager';
import { SubscriptionService } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { PaymentPlatform } from '@gitroom/nestjs-libraries/services/payment/payment.provider.interface';
export declare class PaymentService {
    private _paymentProviderManager;
    private _subscriptionService;
    constructor(_paymentProviderManager: PaymentProviderManager, _subscriptionService: SubscriptionService);
    webhook(provider: string, rawBody: Buffer, headers: Record<string, string | string[] | undefined>): Promise<any>;
    syncSubscription(provider: string, organizationId: string): Promise<{
        active: boolean;
    }>;
    getDefaultProvider(platform: PaymentPlatform): import("@gitroom/nestjs-libraries/services/payment/payment.provider.interface").PaymentProviderAbstract;
    getDefaultProviderName(platform: PaymentPlatform): string;
    getSubscription(organizationId: string): Promise<{
        platform: PaymentPlatform;
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
    getProviderForOrganization(organizationId: string, platform: PaymentPlatform): Promise<import("@gitroom/nestjs-libraries/services/payment/payment.provider.interface").PaymentProviderAbstract>;
    assertCanUseProvider(organizationId: string, provider: string): Promise<void>;
    cancelAllSubscriptions(organizationId: string): Promise<any>;
    syncCustomerEmailsAfterSwitch(accounts: {
        id: string;
        email: string;
    }[]): Promise<void>;
}
