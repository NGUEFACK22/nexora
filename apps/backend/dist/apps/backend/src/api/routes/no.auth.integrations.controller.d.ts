import { ConnectIntegrationDto } from '@gitroom/nestjs-libraries/dtos/integrations/connect.integration.dto';
import { IntegrationManager } from '@gitroom/nestjs-libraries/integrations/integration.manager';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { RefreshIntegrationService } from '@gitroom/nestjs-libraries/integrations/refresh.integration.service';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { PermissionsService } from '@gitroom/backend/services/auth/permissions/permissions.service';
export declare class NoAuthIntegrationsController {
    private _integrationManager;
    private _integrationService;
    private _refreshIntegrationService;
    private _organizationService;
    private _permissionsService;
    constructor(_integrationManager: IntegrationManager, _integrationService: IntegrationService, _refreshIntegrationService: RefreshIntegrationService, _organizationService: OrganizationService, _permissionsService: PermissionsService);
    getIntegrations(): Promise<{
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
    connectSocialMedia(integration: string, body: ConnectIntegrationDto): Promise<any>;
    saveProviderPage(id: string, body: any): Promise<{
        success: boolean;
    }>;
    getConnectLink(token: string): Promise<{
        redirectTo?: string;
        identifier: string;
        name: string;
    }>;
    startConnectLink(token: string): Promise<{
        url: string;
    }>;
    extensionRefreshCookies(body: {
        jwt: string;
        cookies: string;
    }): Promise<{
        success: boolean;
        reason: string;
    } | {
        success: boolean;
        reason?: undefined;
    }>;
}
