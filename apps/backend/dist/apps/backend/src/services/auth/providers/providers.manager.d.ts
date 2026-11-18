import { ModuleRef } from '@nestjs/core';
import { AuthProviderAbstract } from '@gitroom/backend/services/auth/providers.interface';
export declare class AuthProviderManager {
    private _moduleRef;
    constructor(_moduleRef: ModuleRef);
    getProvider(provider: string): AuthProviderAbstract;
}
