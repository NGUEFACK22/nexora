import { User } from '@prisma/client';
import { AttributionProviderManager } from '@gitroom/nestjs-libraries/services/attribution/attribution.provider.manager';
export declare class AttributionService {
    private _attributionProviderManager;
    constructor(_attributionProviderManager: AttributionProviderManager);
    queryParams(): any;
    lead(user: Pick<User, 'id' | 'email' | 'name' | 'lastName'>, attribution?: Record<string, string>): Promise<void>;
}
