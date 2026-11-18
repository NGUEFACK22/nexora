import { IntegrationRepository } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.repository';
import { IntegrationManager } from '@gitroom/nestjs-libraries/integrations/integration.manager';
import { AnalyticsData, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { Integration, Organization } from '@prisma/client';
import { NotificationService } from '@gitroom/nestjs-libraries/database/prisma/notifications/notification.service';
import { IntegrationTimeDto } from '@gitroom/nestjs-libraries/dtos/integrations/integration.time.dto';
import { PlugDto } from '@gitroom/nestjs-libraries/dtos/plugs/plug.dto';
import { AutopostRepository } from '@gitroom/nestjs-libraries/database/prisma/autopost/autopost.repository';
import { RefreshIntegrationService } from '@gitroom/nestjs-libraries/integrations/refresh.integration.service';
import { TemporalService } from 'nestjs-temporal-core';
import { EncryptionService } from '@gitroom/nestjs-libraries/services/encryption.service';
export declare class IntegrationService {
    private _integrationRepository;
    private _autopostsRepository;
    private _integrationManager;
    private _notificationService;
    private _refreshIntegrationService;
    private _temporalService;
    private _encryptionService;
    private storage;
    constructor(_integrationRepository: IntegrationRepository, _autopostsRepository: AutopostRepository, _integrationManager: IntegrationManager, _notificationService: NotificationService, _refreshIntegrationService: RefreshIntegrationService, _temporalService: TemporalService, _encryptionService: EncryptionService);
    changeActiveCron(orgId: string): Promise<boolean>;
    getMentions(platform: string, q: string): import(".prisma/client").Prisma.PrismaPromise<{
        name: string;
        image: string;
        username: string;
    }[]>;
    insertMentions(platform: string, mentions: {
        name: string;
        username: string;
        image: string;
    }[]): any[] | import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
    setTimes(orgId: string, integrationId: string, times: IntegrationTimeDto): Promise<{
        id: string;
    }>;
    updateProviderSettings(org: string, id: string, additionalSettings: string): import(".prisma/client").Prisma.Prisma__IntegrationClient<{
        id: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    checkPreviousConnections(org: string, id: string): Promise<boolean>;
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
    updateIntegrationGroup(org: string, id: string, group: string): import(".prisma/client").Prisma.Prisma__IntegrationClient<{
        id: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    updateOnCustomerName(org: string, id: string, name: string): Promise<{
        id: string;
    }>;
    getIntegrationsList(org: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    getIntegrationForOrder(id: string, order: string, user: string, org: string): Promise<{
        id: string;
        name: string;
        picture: string;
        providerIdentifier: string;
        inBetweenSteps: boolean;
    }>;
    updateCustomName(org: string, id: string, name: string): import(".prisma/client").Prisma.Prisma__IntegrationClient<{
        id: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    updateNameAndUrl(id: string, name: string, url: string): import(".prisma/client").Prisma.Prisma__IntegrationClient<{
        id: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
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
    refreshToken(provider: SocialProvider, refresh: string): Promise<false | {
        refreshToken: string;
        accessToken: string;
        expiresIn: number;
    }>;
    disconnectChannel(orgId: string, integration: Integration, err?: string): Promise<void>;
    migrateIntegration(org: string, oldInternalId: string, newProvider: string, auth: {
        id: string;
        username: string;
    }): Promise<{
        id: string;
    }>;
    migrateIntegrationOnConnect(org: string, newProvider: string, auth: {
        id: string;
        username: string;
    }): Promise<{
        id: string;
    }>;
    informAboutRefreshError(orgId: string, integration: Integration, err?: string): Promise<void>;
    refreshNeeded(org: string, id: string): Promise<boolean>;
    setBetweenRefreshSteps(id: string): Promise<{
        id: string;
    }>;
    refreshTokens(): Promise<void>;
    disableChannel(org: string, id: string): Promise<void>;
    enableChannel(org: string, totalChannels: number, id: string): Promise<void>;
    getPostsForChannel(org: string, id: string): Promise<(import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PostGroupByOutputType, "group"[]> & {})[]>;
    deleteChannel(org: string, id: string): Promise<{
        id: string;
    }>;
    disableIntegrations(org: string, totalChannels: number): Promise<void>;
    enableAllIntegrations(org: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    checkForDeletedOnceAndUpdate(org: string, page: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    saveProviderPage(org: string, id: string, data: any): Promise<{
        success: boolean;
    }>;
    createConnectLink(org: string, integration: string, redirectUrl?: string): Promise<{
        url: string;
    }>;
    private connectLinkRedirectHost;
    private loadConnectLink;
    getConnectLinkOrganization(token: string): Promise<string>;
    getConnectLink(token: string): Promise<{
        redirectTo?: string;
        identifier: string;
        name: string;
    }>;
    startConnectLink(token: string): Promise<{
        url: string;
    }>;
    checkAnalytics(org: Organization, integration: string, date: string, forceRefresh?: boolean): Promise<AnalyticsData[]>;
    customers(orgId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        orgId: string;
    }[]>;
    updateCustomerName(orgId: string, id: string, name: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        orgId: string;
    }>;
    getPlugsByIntegrationId(org: string, integrationId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        data: string;
        organizationId: string;
        activated: boolean;
        integrationId: string;
        plugFunction: string;
    }[]>;
    processInternalPlug(data: {
        post: string;
        originalIntegration: string;
        integration: string;
        plugName: string;
        orgId: string;
        delay: number;
        information: any;
    }, forceRefresh?: boolean): Promise<any>;
    processPlugs(data: {
        plugId: string;
        postId: string;
        delay: number;
        totalRuns: number;
        currentRun: number;
    }): Promise<boolean>;
    createOrUpdatePlug(orgId: string, integrationId: string, body: PlugDto): Promise<{
        activated: boolean;
    }>;
    changePlugActivation(orgId: string, plugId: string, status: boolean): Promise<{
        id: string;
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
    loadExisingData(methodName: string, integrationId: string, id: string[]): Promise<any>;
    decryptTokens<T extends Partial<Integration>>(integration: T): Promise<T>;
    encryptStoredTokens(afterId?: string): Promise<{
        changed: number;
        failed: number;
        lastId: string;
    }>;
    findFreeDateTime(orgId: string, integrationsId?: string): Promise<number[]>;
}
