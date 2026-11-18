"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminStatsRepository = void 0;
const prisma_service_1 = require("../prisma.service");
const common_1 = require("@nestjs/common");
const UNKNOWN_ERROR_TOKEN = '"message":"Unknown Error"';
const sortDesc = (list) => list.sort((a, b) => b.count - a.count || a.provider.localeCompare(b.provider));
let AdminStatsRepository = class AdminStatsRepository {
    constructor(_post, _integration, _errors, _oauthApp, _oauthAuth) {
        this._post = _post;
        this._integration = _integration;
        this._errors = _errors;
        this._oauthApp = _oauthApp;
        this._oauthAuth = _oauthAuth;
    }
    async errorStats(params) {
        const where = {
            createdAt: { gte: params.from, lte: params.to },
            ...(params.unknownOnly
                ? { message: { contains: UNKNOWN_ERROR_TOKEN } }
                : {}),
            ...(params.organizationId
                ? { organizationId: params.organizationId }
                : {}),
        };
        const [total, grouped] = await Promise.all([
            this._errors.model.errors.count({ where }),
            this._errors.model.errors.groupBy({
                by: ['platform'],
                where,
                _count: { _all: true },
            }),
        ]);
        return {
            total,
            perSocial: sortDesc(grouped.map((g) => ({
                provider: g.platform,
                count: g._count._all,
            }))),
        };
    }
    async postStats(params) {
        const where = {
            state: 'PUBLISHED',
            parentPostId: null,
            ...(params.includeDeleted ? {} : { deletedAt: null }),
            publishDate: { gte: params.from, lte: params.to },
            ...(params.organizationId
                ? { organizationId: params.organizationId }
                : {}),
        };
        const [total, grouped] = await Promise.all([
            this._post.model.post.count({ where }),
            this._post.model.post.groupBy({
                by: ['integrationId'],
                where,
                _count: { _all: true },
            }),
        ]);
        const integrationIds = grouped.map((g) => g.integrationId);
        const integrations = integrationIds.length
            ? await this._integration.model.integration.findMany({
                where: { id: { in: integrationIds } },
                select: { id: true, providerIdentifier: true },
            })
            : [];
        const providerById = new Map(integrations.map((i) => [i.id, i.providerIdentifier]));
        const byProvider = new Map();
        for (const g of grouped) {
            const provider = providerById.get(g.integrationId) || 'unknown';
            byProvider.set(provider, (byProvider.get(provider) || 0) + g._count._all);
        }
        return {
            total,
            perSocial: sortDesc([...byProvider.entries()].map(([provider, count]) => ({
                provider,
                count,
            }))),
        };
    }
    async accountStats(params) {
        const whereBase = {
            parentPostId: null,
            deletedAt: null,
            publishDate: { gte: params.from, lte: params.to },
        };
        const [publishedGroups, scheduledGroups] = await Promise.all([
            this._post.model.post.groupBy({
                by: ['organizationId', 'integrationId'],
                where: { ...whereBase, state: 'PUBLISHED' },
            }),
            this._post.model.post.groupBy({
                by: ['organizationId', 'integrationId'],
                where: { ...whereBase, state: { in: ['QUEUE', 'PUBLISHED'] } },
            }),
        ]);
        const integrationIds = [
            ...new Set([...publishedGroups, ...scheduledGroups].map((g) => g.integrationId)),
        ];
        const integrations = integrationIds.length
            ? await this._integration.model.integration.findMany({
                where: { id: { in: integrationIds } },
                select: { id: true, providerIdentifier: true },
            })
            : [];
        const providerById = new Map(integrations.map((i) => [i.id, i.providerIdentifier]));
        const distinctOrgs = (groups) => {
            const allOrgs = new Set();
            const orgsByProvider = new Map();
            for (const g of groups) {
                const provider = providerById.get(g.integrationId) || 'unknown';
                if (!orgsByProvider.has(provider)) {
                    orgsByProvider.set(provider, new Set());
                }
                orgsByProvider.get(provider).add(g.organizationId);
                allOrgs.add(g.organizationId);
            }
            return {
                total: allOrgs.size,
                perSocial: sortDesc([...orgsByProvider.entries()].map(([provider, orgs]) => ({
                    provider,
                    count: orgs.size,
                }))),
            };
        };
        const distinctChannels = (groups) => {
            const allChannels = new Set();
            const channelsByProvider = new Map();
            for (const g of groups) {
                const provider = providerById.get(g.integrationId) || 'unknown';
                if (!channelsByProvider.has(provider)) {
                    channelsByProvider.set(provider, new Set());
                }
                channelsByProvider.get(provider).add(g.integrationId);
                allChannels.add(g.integrationId);
            }
            return {
                total: allChannels.size,
                perSocial: sortDesc([...channelsByProvider.entries()].map(([provider, channels]) => ({
                    provider,
                    count: channels.size,
                }))),
            };
        };
        return {
            publishingAccounts: distinctOrgs(publishedGroups),
            scheduledAccounts: distinctOrgs(scheduledGroups),
            publishingChannels: distinctChannels(publishedGroups),
            scheduledChannels: distinctChannels(scheduledGroups),
        };
    }
    async sourceStats(params) {
        const where = {
            parentPostId: null,
            deletedAt: null,
            publishDate: { gte: params.from, lte: params.to },
            state: { in: ['QUEUE', 'PUBLISHED', 'ERROR'] },
        };
        const groups = await this._post.model.post.groupBy({
            by: ['organizationId', 'creationMethod'],
            where,
        });
        const allOrgs = new Set();
        const orgsBySource = new Map();
        for (const g of groups) {
            if (!orgsBySource.has(g.creationMethod)) {
                orgsBySource.set(g.creationMethod, new Set());
            }
            orgsBySource.get(g.creationMethod).add(g.organizationId);
            allOrgs.add(g.organizationId);
        }
        return {
            total: allOrgs.size,
            perSocial: sortDesc([...orgsBySource.entries()].map(([provider, orgs]) => ({
                provider,
                count: orgs.size,
            }))),
        };
    }
    async connectedStats(params) {
        const where = {
            ...(params.includeDeleted ? {} : { deletedAt: null }),
            createdAt: { gte: params.from, lte: params.to },
            ...(params.organizationId
                ? { organizationId: params.organizationId }
                : {}),
        };
        const [total, grouped] = await Promise.all([
            this._integration.model.integration.count({ where }),
            this._integration.model.integration.groupBy({
                by: ['providerIdentifier'],
                where,
                _count: { _all: true },
            }),
        ]);
        return {
            total,
            perSocial: sortDesc(grouped.map((g) => ({
                provider: g.providerIdentifier,
                count: g._count._all,
            }))),
        };
    }
    async clientStats(params) {
        const where = {
            accessToken: { not: null },
            ...(params.includeDeleted ? {} : { revokedAt: null }),
            createdAt: { gte: params.from, lte: params.to },
            ...(params.organizationId
                ? { organizationId: params.organizationId }
                : {}),
        };
        const [total, grouped] = await Promise.all([
            this._oauthAuth.model.oAuthAuthorization.count({ where }),
            this._oauthAuth.model.oAuthAuthorization.groupBy({
                by: ['oauthAppId'],
                where,
                _count: { _all: true },
            }),
        ]);
        const appIds = grouped.map((g) => g.oauthAppId);
        const apps = appIds.length
            ? await this._oauthApp.model.oAuthApp.findMany({
                where: { id: { in: appIds } },
                select: { id: true, name: true },
            })
            : [];
        const nameById = new Map(apps.map((a) => [a.id, a.name.trim().toLowerCase()]));
        const byName = new Map();
        for (const g of grouped) {
            const name = nameById.get(g.oauthAppId) || 'unknown';
            byName.set(name, (byName.get(name) || 0) + g._count._all);
        }
        return {
            total,
            perSocial: sortDesc([...byName.entries()].map(([provider, count]) => ({
                provider,
                count,
            }))),
        };
    }
    async postStateStats(params) {
        const grouped = await this._post.model.post.groupBy({
            by: ['state'],
            where: {
                organizationId: params.organizationId,
                parentPostId: null,
                ...(params.includeDeleted ? {} : { deletedAt: null }),
                publishDate: { gte: params.from, lte: params.to },
            },
            _count: { _all: true },
        });
        return grouped
            .map((g) => ({ state: g.state, count: g._count._all }))
            .sort((a, b) => b.count - a.count || a.state.localeCompare(b.state));
    }
    async currentChannelStats(organizationId, includeDeleted) {
        const where = {
            organizationId,
            ...(includeDeleted ? {} : { deletedAt: null }),
        };
        const [total, grouped] = await Promise.all([
            this._integration.model.integration.count({ where }),
            this._integration.model.integration.groupBy({
                by: ['providerIdentifier'],
                where,
                _count: { _all: true },
            }),
        ]);
        return {
            total,
            perSocial: sortDesc(grouped.map((g) => ({
                provider: g.providerIdentifier,
                count: g._count._all,
            }))),
        };
    }
    async activityRange(organizationId, includeDeleted) {
        const { _min, _max } = await this._post.model.post.aggregate({
            where: {
                organizationId,
                state: 'PUBLISHED',
                ...(includeDeleted ? {} : { deletedAt: null }),
            },
            _min: { publishDate: true },
            _max: { publishDate: true },
        });
        return {
            firstActivityAt: _min.publishDate?.toISOString() || null,
            lastActivityAt: _max.publishDate?.toISOString() || null,
        };
    }
    async getOrgActivity(params) {
        const errors = await this.errorStats(params);
        const posts = await this.postStats(params);
        const connectedInRange = await this.connectedStats(params);
        const channels = await this.currentChannelStats(params.organizationId, params.includeDeleted);
        const postsByState = await this.postStateStats(params);
        const activity = await this.activityRange(params.organizationId, params.includeDeleted);
        return {
            from: params.from.toISOString(),
            to: params.to.toISOString(),
            organizationId: params.organizationId,
            errors,
            posts,
            connectedInRange,
            channels,
            postsByState,
            ...activity,
        };
    }
    async getStats(params) {
        const errors = await this.errorStats(params);
        const posts = await this.postStats(params);
        const accounts = await this.accountStats(params);
        const connected = await this.connectedStats(params);
        const activeOrgsBySource = await this.sourceStats(params);
        const connectedClients = await this.clientStats(params);
        return {
            from: params.from.toISOString(),
            to: params.to.toISOString(),
            errors,
            posts,
            connected,
            publishingAccounts: accounts.publishingAccounts,
            scheduledAccounts: accounts.scheduledAccounts,
            publishingChannels: accounts.publishingChannels,
            scheduledChannels: accounts.scheduledChannels,
            activeOrgsBySource,
            connectedClients,
        };
    }
};
exports.AdminStatsRepository = AdminStatsRepository;
exports.AdminStatsRepository = AdminStatsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository])
], AdminStatsRepository);
//# sourceMappingURL=admin-stats.repository.js.map