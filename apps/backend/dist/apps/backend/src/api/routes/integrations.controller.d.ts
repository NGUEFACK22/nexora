import { IntegrationManager } from '@gitroom/nestjs-libraries/integrations/integration.manager';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { Organization, User } from '@prisma/client';
import { IntegrationFunctionDto } from '@gitroom/nestjs-libraries/dtos/integrations/integration.function.dto';
import { PostsService } from '@gitroom/nestjs-libraries/database/prisma/posts/posts.service';
import { IntegrationTimeDto } from '@gitroom/nestjs-libraries/dtos/integrations/integration.time.dto';
import { IntegrationNameDto } from '@gitroom/nestjs-libraries/dtos/integrations/integration.name.dto';
import { CustomerNameDto } from '@gitroom/nestjs-libraries/dtos/integrations/customer.name.dto';
import { PlugDto } from '@gitroom/nestjs-libraries/dtos/plugs/plug.dto';
import { RefreshIntegrationService } from '@gitroom/nestjs-libraries/integrations/refresh.integration.service';
export declare class IntegrationsController {
    private _integrationManager;
    private _integrationService;
    private _postService;
    private _refreshIntegrationService;
    constructor(_integrationManager: IntegrationManager, _integrationService: IntegrationService, _postService: PostsService, _refreshIntegrationService: RefreshIntegrationService);
    saveProviderPage(org: Organization, id: string, body: any): Promise<{
        success: boolean;
    }>;
    getInternalPlugs(identifier: string): {
        internalPlugs: any;
    };
    getCustomers(org: Organization): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        orgId: string;
    }[]>;
    updateCustomerName(org: Organization, id: string, body: CustomerNameDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        orgId: string;
    }>;
    updateIntegrationGroup(org: Organization, id: string, body: {
        group: string;
    }): Promise<{
        id: string;
    }>;
    updateOnCustomerName(org: Organization, id: string, body: {
        name: string;
    }): Promise<{
        id: string;
    }>;
    updateCustomName(org: Organization, id: string, body: IntegrationNameDto): Promise<{
        id: string;
    }>;
    getIntegrationList(org: Organization): Promise<{
        integrations: {
            display: string;
            type: string;
            time: any;
            changeProfilePicture: boolean;
            changeNickName: boolean;
            customer: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                orgId: string;
            };
            additionalSettings: string;
            customFields?: {
                key: string;
                label: string;
                defaultValue?: string;
                validation: string;
                type: "text" | "password";
                hint?: string;
            }[];
            name: string;
            originalName: string;
            id: string;
            internalId: string;
            disabled: boolean;
            editor: "html" | "none" | "normal" | "markdown";
            stripLinks: boolean;
            picture: string;
            identifier: string;
            inBetweenSteps: boolean;
            refreshNeeded: boolean;
            isCustomFields: boolean;
            isChromeExtension: boolean;
        }[];
    }>;
    updateProviderSettings(org: Organization, id: string, body: string): Promise<void>;
    setNickname(org: Organization, id: string, body: {
        name: string;
        picture: string;
    }): Promise<{
        id: string;
    }>;
    getSingleIntegration(id: string, order: string, user: User, org: Organization): Promise<{
        id: string;
        name: string;
        picture: string;
        providerIdentifier: string;
        inBetweenSteps: boolean;
    }>;
    getIntegrationUrl(integration: string, refresh: string, externalUrl: string, redirectUrl: string, onboarding: string, org: Organization): Promise<{
        url: string;
        err?: undefined;
    } | {
        err: boolean;
        url?: undefined;
    }>;
    setTime(org: Organization, id: string, body: IntegrationTimeDto): Promise<{
        id: string;
    }>;
    mentions(org: Organization, body: IntegrationFunctionDto): Promise<any[] | {
        none: true;
    }>;
    functionIntegration(org: Organization, body: IntegrationFunctionDto): Promise<any>;
    disableChannel(org: Organization, id: string): Promise<void>;
    enableChannel(org: Organization, id: string): Promise<void>;
    deleteChannel(org: Organization, id: string): Promise<{
        id: string;
    }>;
    getPlugList(): Promise<{
        plugs: {
            name: string;
            identifier: string;
            plugs: any;
        }[];
    }>;
    getPlugsByIntegrationId(id: string, org: Organization): Promise<{
        id: string;
        data: string;
        organizationId: string;
        activated: boolean;
        integrationId: string;
        plugFunction: string;
    }[]>;
    postPlugsByIntegrationId(id: string, org: Organization, body: PlugDto): Promise<{
        activated: boolean;
    }>;
    changePlugActivation(id: string, org: Organization, status: boolean): Promise<{
        id: string;
    }>;
    getUpdates(query: {
        word: string;
        id?: number;
    }): Promise<{
        chatId: number;
        lastChatId?: undefined;
    } | {
        lastChatId: number;
        chatId?: undefined;
    } | {
        chatId?: undefined;
        lastChatId?: undefined;
    }>;
    moltbookRegister(body: {
        name: string;
        description: string;
    }): Promise<{
        apiKey: any;
        claimUrl: any;
        verificationCode: any;
        error?: undefined;
    } | {
        error: any;
        apiKey?: undefined;
        claimUrl?: undefined;
        verificationCode?: undefined;
    }>;
    moltbookStatus(apiKey: string): Promise<{
        claimed: boolean;
    }>;
}
