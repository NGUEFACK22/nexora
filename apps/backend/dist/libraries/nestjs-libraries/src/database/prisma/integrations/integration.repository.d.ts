import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { Integration, Prisma } from '@prisma/client';
import { IntegrationTimeDto } from '@gitroom/nestjs-libraries/dtos/integrations/integration.time.dto';
import { PlugDto } from '@gitroom/nestjs-libraries/dtos/plugs/plug.dto';
import { EncryptionService } from '@gitroom/nestjs-libraries/services/encryption.service';
export declare class IntegrationRepository {
    private _integration;
    private _posts;
    private _plugs;
    private _exisingPlugData;
    private _customers;
    private _mentions;
    private _encryptionService;
    private storage;
    constructor(_integration: PrismaRepository<'integration'>, _posts: PrismaRepository<'post'>, _plugs: PrismaRepository<'plugs'>, _exisingPlugData: PrismaRepository<'exisingPlugData'>, _customers: PrismaRepository<'customer'>, _mentions: PrismaRepository<'mentions'>, _encryptionService: EncryptionService);
    private decryptTokens;
    getMentions(platform: string, q: string): Prisma.PrismaPromise<{
        name: string;
        image: string;
        username: string;
    }[]>;
    insertMentions(platform: string, mentions: {
        name: string;
        username: string;
        image: string;
    }[]): any[] | Prisma.PrismaPromise<Prisma.BatchPayload>;
    checkPreviousConnections(org: string, id: string): Promise<boolean>;
    updateProviderSettings(org: string, id: string, settings: string): Prisma.Prisma__IntegrationClient<{
        id: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    updateCustomName(org: string, id: string, name: string): Prisma.Prisma__IntegrationClient<{
        id: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    setTimes(org: string, id: string, times: IntegrationTimeDto): Promise<{
        id: string;
    }>;
    getPlug(plugId: string): Promise<{
        integration: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date | null;
            deletedAt: Date | null;
            organizationId: string;
            disabled: boolean;
            picture: string | null;
            type: string;
            profile: string | null;
            token: string;
            refreshToken: string | null;
            internalId: string;
            customName: string | null;
            providerIdentifier: string;
            tokenExpiration: Date | null;
            inBetweenSteps: boolean;
            refreshNeeded: boolean;
            postingTimes: string;
            customInstanceDetails: string | null;
            customerId: string | null;
            rootInternalId: string | null;
            additionalSettings: string | null;
        };
    } & {
        id: string;
        data: string;
        organizationId: string;
        activated: boolean;
        integrationId: string;
        plugFunction: string;
    }>;
    getPlugs(orgId: string, integrationId: string): Promise<({
        integration: {
            id: string;
            providerIdentifier: string;
        };
    } & {
        id: string;
        data: string;
        organizationId: string;
        activated: boolean;
        integrationId: string;
        plugFunction: string;
    })[]>;
    updateIntegration(id: string, params: Partial<Integration>): Promise<{
        id: string;
    }>;
    disconnectChannel(org: string, id: string): Prisma.Prisma__IntegrationClient<{
        id: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    getIntegrationByInternalId(org: string, internalId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date | null;
        deletedAt: Date | null;
        organizationId: string;
        disabled: boolean;
        picture: string | null;
        type: string;
        profile: string | null;
        token: string;
        refreshToken: string | null;
        internalId: string;
        customName: string | null;
        providerIdentifier: string;
        tokenExpiration: Date | null;
        inBetweenSteps: boolean;
        refreshNeeded: boolean;
        postingTimes: string;
        customInstanceDetails: string | null;
        customerId: string | null;
        rootInternalId: string | null;
        additionalSettings: string | null;
    }>;
    migrateIntegration(org: string, id: string, internalId: string, providerIdentifier: string, rootInternalId: string): Promise<{
        id: string;
    }>;
    createOrUpdateIntegration(additionalSettings: {
        title: string;
        description: string;
        type: 'checkbox' | 'text' | 'textarea';
        value: any;
        regex?: string;
    }[] | undefined, oneTimeToken: boolean, org: string, name: string, picture: string | undefined, type: 'article' | 'social', internalId: string, provider: string, token: string, refreshToken?: string, expiresIn?: number, username?: string, isBetweenSteps?: boolean, refresh?: string, timezone?: number, customInstanceDetails?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date | null;
        deletedAt: Date | null;
        organizationId: string;
        disabled: boolean;
        picture: string | null;
        type: string;
        profile: string | null;
        token: string;
        refreshToken: string | null;
        internalId: string;
        customName: string | null;
        providerIdentifier: string;
        tokenExpiration: Date | null;
        inBetweenSteps: boolean;
        refreshNeeded: boolean;
        postingTimes: string;
        customInstanceDetails: string | null;
        customerId: string | null;
        rootInternalId: string | null;
        additionalSettings: string | null;
    }>;
    needsToBeRefreshed(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date | null;
        deletedAt: Date | null;
        organizationId: string;
        disabled: boolean;
        picture: string | null;
        type: string;
        profile: string | null;
        token: string;
        refreshToken: string | null;
        internalId: string;
        customName: string | null;
        providerIdentifier: string;
        tokenExpiration: Date | null;
        inBetweenSteps: boolean;
        refreshNeeded: boolean;
        postingTimes: string;
        customInstanceDetails: string | null;
        customerId: string | null;
        rootInternalId: string | null;
        additionalSettings: string | null;
    }[]>;
    setBetweenRefreshSteps(id: string): Promise<{
        id: string;
    }>;
    refreshNeeded(org: string, id: string): Promise<boolean>;
    updateNameAndUrl(id: string, name: string, url: string): Prisma.Prisma__IntegrationClient<{
        id: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    getIntegrationById(org: string, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date | null;
        deletedAt: Date | null;
        organizationId: string;
        disabled: boolean;
        picture: string | null;
        type: string;
        profile: string | null;
        token: string;
        refreshToken: string | null;
        internalId: string;
        customName: string | null;
        providerIdentifier: string;
        tokenExpiration: Date | null;
        inBetweenSteps: boolean;
        refreshNeeded: boolean;
        postingTimes: string;
        customInstanceDetails: string | null;
        customerId: string | null;
        rootInternalId: string | null;
        additionalSettings: string | null;
    }>;
    getIntegrationForOrder(id: string, order: string, user: string, org: string): Promise<{
        id: string;
        name: string;
        picture: string;
        providerIdentifier: string;
        inBetweenSteps: boolean;
    }>;
    updateOnCustomerName(org: string, id: string, name: string): Promise<{
        id: string;
    }>;
    updateIntegrationGroup(org: string, id: string, group: string): Prisma.Prisma__IntegrationClient<{
        id: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    getCustomerByName(orgId: string, name: string): Prisma.Prisma__CustomerClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        orgId: string;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    updateCustomerName(orgId: string, id: string, name: string): Prisma.Prisma__CustomerClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        orgId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    customers(orgId: string): Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        orgId: string;
    }[]>;
    getIntegrationsList(org: string): Prisma.PrismaPromise<({
        customer: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            orgId: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date | null;
        deletedAt: Date | null;
        organizationId: string;
        disabled: boolean;
        picture: string | null;
        type: string;
        profile: string | null;
        internalId: string;
        customName: string | null;
        providerIdentifier: string;
        tokenExpiration: Date | null;
        inBetweenSteps: boolean;
        refreshNeeded: boolean;
        postingTimes: string;
        customInstanceDetails: string | null;
        customerId: string | null;
        rootInternalId: string | null;
        additionalSettings: string | null;
    })[]>;
    private latestPostsFor;
    private firstPerIntegration;
    getChannelHealth(org: string, includeDeleted?: boolean): Promise<{
        lastPublishedAt: Date;
        lastPublishedPostId: string;
        lastPublishedUrl: string;
        lastErrorAt: Date;
        lastErrorPostId: string;
        lastError: string;
        customer: {
            id: string;
            name: string;
        };
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        disabled: boolean;
        type: string;
        internalId: string;
        providerIdentifier: string;
        tokenExpiration: Date;
        inBetweenSteps: boolean;
        refreshNeeded: boolean;
    }[]>;
    disableChannel(org: string, id: string): Promise<void>;
    enableChannel(org: string, id: string): Promise<void>;
    getPostsForChannel(org: string, id: string): Prisma.GetPostGroupByPayload<{
        by: "group"[];
        where: {
            organizationId: string;
            integrationId: string;
            deletedAt: null;
        };
    }>;
    deleteChannel(org: string, id: string): Prisma.Prisma__IntegrationClient<{
        id: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    deleteIntegrationsForAccount(org: string): Promise<void>;
    checkForDeletedOnceAndUpdate(org: string, page: string): Promise<Prisma.BatchPayload>;
    disableIntegrations(org: string, totalChannels: number): Promise<void>;
    enableAllIntegrations(org: string): Prisma.PrismaPromise<Prisma.BatchPayload>;
    getPlugsByIntegrationId(org: string, id: string): Prisma.PrismaPromise<{
        id: string;
        data: string;
        organizationId: string;
        activated: boolean;
        integrationId: string;
        plugFunction: string;
    }[]>;
    createOrUpdatePlug(org: string, integrationId: string, body: PlugDto): Prisma.Prisma__PlugsClient<{
        activated: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    changePlugActivation(orgId: string, plugId: string, status: boolean): Prisma.Prisma__PlugsClient<{
        id: string;
        data: string;
        organizationId: string;
        activated: boolean;
        integrationId: string;
        plugFunction: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    loadExisingData(methodName: string, integrationId: string, id: string[]): Promise<{
        id: string;
        integrationId: string;
        value: string;
        methodName: string;
    }[]>;
    saveExisingData(methodName: string, integrationId: string, value: string[]): Promise<Prisma.BatchPayload>;
    getPlainTokens(afterId?: string): Prisma.PrismaPromise<{
        id: string;
        updatedAt: Date;
        token: string;
        refreshToken: string;
    }[]>;
    encryptStoredTokens(integration: Pick<Integration, 'id' | 'token' | 'refreshToken' | 'updatedAt'>): Promise<boolean>;
    getPostingTimes(orgId: string, integrationsId?: string): Promise<{
        postingTimes: string;
    }[]>;
}
