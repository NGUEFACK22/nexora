import { ModuleRef } from '@nestjs/core';
import { AttributionProviderAbstract } from '@gitroom/nestjs-libraries/services/attribution/attribution.provider.interface';
export declare class AttributionProviderManager {
    private _moduleRef;
    constructor(_moduleRef: ModuleRef);
    getProviders(): {
        name: string;
        provider: AttributionProviderAbstract;
    }[];
}
