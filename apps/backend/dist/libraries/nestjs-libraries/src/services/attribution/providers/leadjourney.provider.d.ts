import { AttributionLead, AttributionProviderAbstract } from '@gitroom/nestjs-libraries/services/attribution/attribution.provider.interface';
export declare class LeadJourneyProvider extends AttributionProviderAbstract {
    queryParam: string;
    isEnabled(): boolean;
    lead(lead: AttributionLead, clickId: string): Promise<void>;
}
