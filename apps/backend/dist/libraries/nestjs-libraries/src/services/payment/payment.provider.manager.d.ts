import { ModuleRef } from '@nestjs/core';
import { PaymentPlatform, PaymentProviderAbstract } from '@gitroom/nestjs-libraries/services/payment/payment.provider.interface';
export declare class PaymentProviderManager {
    private _moduleRef;
    constructor(_moduleRef: ModuleRef);
    private metadata;
    getProvider(provider: string): PaymentProviderAbstract;
    getProviders(): {
        name: string;
        provider: PaymentProviderAbstract;
    }[];
    getDefaultProvider(platform: PaymentPlatform): {
        name: string;
        provider: PaymentProviderAbstract;
    };
}
