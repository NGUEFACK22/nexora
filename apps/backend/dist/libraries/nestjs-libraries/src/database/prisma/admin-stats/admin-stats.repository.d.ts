import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
export interface StatsParams {
    from: Date;
    to: Date;
    unknownOnly?: boolean;
    organizationId?: string;
    includeDeleted?: boolean;
}
export interface OrgActivityParams {
    from: Date;
    to: Date;
    organizationId: string;
    includeDeleted?: boolean;
}
interface PerSocial {
    provider: string;
    count: number;
}
interface PerState {
    state: string;
    count: number;
}
export interface OrgActivityResponse {
    from: string;
    to: string;
    organizationId: string;
    errors: {
        total: number;
        perSocial: PerSocial[];
    };
    posts: {
        total: number;
        perSocial: PerSocial[];
    };
    connectedInRange: {
        total: number;
        perSocial: PerSocial[];
    };
    channels: {
        total: number;
        perSocial: PerSocial[];
    };
    postsByState: PerState[];
    firstActivityAt: string | null;
    lastActivityAt: string | null;
}
export interface StatsResponse {
    from: string;
    to: string;
    errors: {
        total: number;
        perSocial: PerSocial[];
    };
    posts: {
        total: number;
        perSocial: PerSocial[];
    };
    connected: {
        total: number;
        perSocial: PerSocial[];
    };
    publishingAccounts: {
        total: number;
        perSocial: PerSocial[];
    };
    scheduledAccounts: {
        total: number;
        perSocial: PerSocial[];
    };
    publishingChannels: {
        total: number;
        perSocial: PerSocial[];
    };
    scheduledChannels: {
        total: number;
        perSocial: PerSocial[];
    };
    activeOrgsBySource: {
        total: number;
        perSocial: PerSocial[];
    };
    connectedClients: {
        total: number;
        perSocial: PerSocial[];
    };
}
export declare class AdminStatsRepository {
    private _post;
    private _integration;
    private _errors;
    private _oauthApp;
    private _oauthAuth;
    constructor(_post: PrismaRepository<'post'>, _integration: PrismaRepository<'integration'>, _errors: PrismaRepository<'errors'>, _oauthApp: PrismaRepository<'oAuthApp'>, _oauthAuth: PrismaRepository<'oAuthAuthorization'>);
    private errorStats;
    private postStats;
    private accountStats;
    private sourceStats;
    private connectedStats;
    private clientStats;
    private postStateStats;
    private currentChannelStats;
    private activityRange;
    getOrgActivity(params: OrgActivityParams): Promise<OrgActivityResponse>;
    getStats(params: StatsParams): Promise<StatsResponse>;
}
export {};
