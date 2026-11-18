import 'reflect-metadata';
import { SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract } from '@gitroom/nestjs-libraries/integrations/social.abstract';
export declare const socialIntegrationList: Array<SocialAbstract & SocialProvider>;
export declare class IntegrationManager {
    isHiddenProvider(identifier: string): boolean;
    getMigrationTarget(identifier: string): string | undefined;
    getMigrationSources(identifier: string): string[];
    getAllIntegrations(): Promise<{
        social: {
            customFields?: {
                key: string;
                label: string;
                defaultValue?: string;
                validation: string;
                type: "text" | "password";
                hint?: string;
            }[];
            extensionCookies?: {
                name: string;
                domain: string;
            }[];
            name: string;
            identifier: string;
            toolTip: string;
            editor: "html" | "none" | "normal" | "markdown";
            isExternal: boolean;
            isWeb3: boolean;
            isChromeExtension: boolean;
        }[];
        article: any[];
    }>;
    getAllTools(): {
        [key: string]: {
            description: string;
            dataSchema: any;
            methodName: string;
        }[];
    };
    isDashboardCallable(provider: SocialProvider, methodName: string): boolean;
    getAllRulesDescription(): {
        [key: string]: string;
    };
    getAllPlugs(): {
        name: string;
        identifier: string;
        plugs: any;
    }[];
    getInternalPlugs(providerName: string): {
        internalPlugs: any;
    };
    getAllowedSocialsIntegrations(): string[];
    getLinkableSocialsIntegrations(): string[];
    getSocialIntegration(integration: string): SocialProvider;
}
