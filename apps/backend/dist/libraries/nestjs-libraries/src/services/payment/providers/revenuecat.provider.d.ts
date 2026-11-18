import { PaymentPlatform, PaymentProviderAbstract } from '@gitroom/nestjs-libraries/services/payment/payment.provider.interface';
import { SubscriptionService } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
export declare class RevenueCatProvider extends PaymentProviderAbstract {
    private _subscriptionService;
    private _organizationService;
    platform: PaymentPlatform;
    constructor(_subscriptionService: SubscriptionService, _organizationService: OrganizationService);
    validateWebhook(rawBody: Buffer, headers: Record<string, string | string[] | undefined>): any;
    processWebhook(body: any): Promise<{
        ok: boolean;
    }>;
    cancelAllSubscriptions(organizationId: string): Promise<void>;
    syncSubscription(organizationId: string): Promise<{
        active: boolean;
    }>;
    private getActiveSubscription;
    private parseProductId;
}
