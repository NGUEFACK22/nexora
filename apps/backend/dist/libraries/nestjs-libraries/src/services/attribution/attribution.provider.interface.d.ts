export interface AttributionLead {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}
export declare abstract class AttributionProviderAbstract {
    abstract queryParam: string;
    abstract isEnabled(): boolean;
    abstract lead(lead: AttributionLead, clickId: string): Promise<void>;
}
export interface AttributionProviderParams {
    provider: string;
}
export declare function AttributionProvider(params: AttributionProviderParams): (target: any) => void;
