"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationRepository = void 0;
const tslib_1 = require("tslib");
const prisma_service_1 = require("@gitroom/nestjs-libraries/database/prisma/prisma.service");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const make_is_1 = require("@gitroom/nestjs-libraries/services/make.is");
const upload_factory_1 = require("@gitroom/nestjs-libraries/upload/upload.factory");
const encryption_service_1 = require("@gitroom/nestjs-libraries/services/encryption.service");
let IntegrationRepository = class IntegrationRepository {
    constructor(_integration, _posts, _plugs, _exisingPlugData, _customers, _mentions, _encryptionService) {
        this._integration = _integration;
        this._posts = _posts;
        this._plugs = _plugs;
        this._exisingPlugData = _exisingPlugData;
        this._customers = _customers;
        this._mentions = _mentions;
        this._encryptionService = _encryptionService;
        this.storage = upload_factory_1.UploadFactory.createStorage();
    }
    async decryptTokens(integration) {
        return integration
            ? this._encryptionService.decryptFields(integration, encryption_service_1.integrationEncryptedFields)
            : integration;
    }
    getMentions(platform, q) {
        return this._mentions.model.mentions.findMany({
            where: {
                platform,
                OR: [
                    {
                        name: {
                            contains: q,
                            mode: 'insensitive',
                        },
                    },
                    {
                        username: {
                            contains: q,
                            mode: 'insensitive',
                        },
                    },
                ],
            },
            orderBy: {
                name: 'asc',
            },
            take: 100,
            select: {
                name: true,
                username: true,
                image: true,
            },
        });
    }
    insertMentions(platform, mentions) {
        if (mentions.length === 0) {
            return [];
        }
        return this._mentions.model.mentions.createMany({
            data: mentions.map((mention) => ({
                platform,
                name: mention.name,
                username: mention.username,
                image: mention.image,
            })),
            skipDuplicates: true,
        });
    }
    async checkPreviousConnections(org, id) {
        const findIt = await this._integration.model.integration.findMany({
            where: {
                rootInternalId: {
                    in: [id, (0, crypto_1.createHash)('md5').update(id).digest('hex')],
                },
            },
            select: {
                organizationId: true,
                id: true,
            },
        });
        if (findIt.some((f) => f.organizationId === org)) {
            return false;
        }
        return findIt.length > 0;
    }
    updateProviderSettings(org, id, settings) {
        return this._integration.model.integration.update({
            select: {
                id: true,
            },
            where: {
                id,
                organizationId: org,
            },
            data: {
                additionalSettings: settings,
            },
        });
    }
    updateCustomName(org, id, name) {
        return this._integration.model.integration.update({
            select: {
                id: true,
            },
            where: {
                id,
                organizationId: org,
            },
            data: {
                customName: name.trim() || null,
            },
        });
    }
    async setTimes(org, id, times) {
        return this._integration.model.integration.update({
            select: {
                id: true,
            },
            where: {
                id,
                organizationId: org,
            },
            data: {
                postingTimes: JSON.stringify(times.time),
            },
        });
    }
    async getPlug(plugId) {
        const plug = await this._plugs.model.plugs.findFirst({
            where: {
                id: plugId,
            },
            include: {
                integration: true,
            },
        });
        return plug
            ? { ...plug, integration: await this.decryptTokens(plug.integration) }
            : plug;
    }
    async getPlugs(orgId, integrationId) {
        return this._plugs.model.plugs.findMany({
            where: {
                integrationId,
                organizationId: orgId,
                activated: true,
            },
            include: {
                integration: {
                    select: {
                        id: true,
                        providerIdentifier: true,
                    },
                },
            },
        });
    }
    async updateIntegration(id, params) {
        if (params.picture &&
            (params.picture.indexOf(process.env.CLOUDFLARE_BUCKET_URL) === -1 ||
                params.picture.indexOf(process.env.FRONTEND_URL) === -1)) {
            params.picture = await this.storage.uploadSimple(params.picture);
        }
        const existing = await this._integration.model.integration.findUnique({
            where: {
                organizationId_internalId: {
                    organizationId: params.organizationId,
                    internalId: params.internalId,
                },
            },
        });
        const fresh = existing
            ? await this._integration.model.integration.findUnique({
                where: { id },
                select: {
                    rootInternalId: true,
                    refreshToken: true,
                    tokenExpiration: true,
                },
            })
            : null;
        if (existing) {
            await this._posts.model.post.updateMany({
                where: {
                    integrationId: id,
                },
                data: {
                    deletedAt: new Date(),
                },
            });
            await this._integration.model.integration.update({
                where: {
                    id,
                },
                data: {
                    internalId: `deleted_${params.internalId}_${(0, make_is_1.makeId)(10)}`,
                    deletedAt: new Date(),
                },
            });
        }
        return this._integration.model.integration.update({
            select: {
                id: true,
            },
            where: {
                ...(existing ? { id: existing.id } : { id }),
            },
            data: {
                ...(await this._encryptionService.encryptFields(params, encryption_service_1.integrationEncryptedFields)),
                ...(fresh?.rootInternalId
                    ? { rootInternalId: fresh.rootInternalId }
                    : {}),
                ...(fresh?.refreshToken ? { refreshToken: fresh.refreshToken } : {}),
                ...(fresh?.tokenExpiration
                    ? { tokenExpiration: fresh.tokenExpiration }
                    : {}),
                disabled: false,
                deletedAt: null,
                refreshNeeded: false,
            },
        });
    }
    disconnectChannel(org, id) {
        return this._integration.model.integration.update({
            select: {
                id: true,
            },
            where: {
                id,
                organizationId: org,
            },
            data: {
                refreshNeeded: true,
            },
        });
    }
    async getIntegrationByInternalId(org, internalId) {
        return this.decryptTokens(await this._integration.model.integration.findFirst({
            where: {
                organizationId: org,
                internalId,
                deletedAt: null,
            },
        }));
    }
    async migrateIntegration(org, id, internalId, providerIdentifier, rootInternalId) {
        const existing = await this._integration.model.integration.findUnique({
            where: {
                organizationId_internalId: {
                    organizationId: org,
                    internalId,
                },
            },
        });
        if (existing && existing.deletedAt) {
            await this._integration.model.integration.update({
                where: {
                    id: existing.id,
                },
                data: {
                    internalId: `deleted_${internalId}_${(0, make_is_1.makeId)(10)}`,
                },
            });
        }
        return this._integration.model.integration.update({
            select: {
                id: true,
            },
            where: {
                id,
                organizationId: org,
            },
            data: {
                internalId,
                providerIdentifier,
                rootInternalId,
            },
        });
    }
    async createOrUpdateIntegration(additionalSettings, oneTimeToken, org, name, picture, type, internalId, provider, token, refreshToken = '', expiresIn = 999999999, username, isBetweenSteps = false, refresh, timezone, customInstanceDetails) {
        token = await this._encryptionService.encrypt(token);
        refreshToken = await this._encryptionService.encrypt(refreshToken);
        const postTimes = timezone
            ? {
                postingTimes: JSON.stringify([
                    { time: 560 - timezone },
                    { time: 850 - timezone },
                    { time: 1140 - timezone },
                ]),
            }
            : {};
        const upsert = await this._integration.model.integration.upsert({
            where: {
                organizationId_internalId: {
                    internalId,
                    organizationId: org,
                },
            },
            create: {
                type: type,
                name,
                providerIdentifier: provider,
                token,
                profile: username,
                ...(picture ? { picture } : {}),
                inBetweenSteps: isBetweenSteps,
                refreshToken,
                ...(expiresIn
                    ? { tokenExpiration: new Date(Date.now() + expiresIn * 1000) }
                    : {}),
                internalId,
                ...postTimes,
                organizationId: org,
                refreshNeeded: false,
                rootInternalId: internalId,
                ...(customInstanceDetails ? { customInstanceDetails } : {}),
                additionalSettings: additionalSettings
                    ? JSON.stringify(additionalSettings)
                    : '[]',
            },
            update: {
                ...(additionalSettings
                    ? { additionalSettings: JSON.stringify(additionalSettings) }
                    : {}),
                ...(customInstanceDetails ? { customInstanceDetails } : {}),
                type: type,
                ...(!refresh
                    ? {
                        inBetweenSteps: isBetweenSteps,
                    }
                    : {}),
                ...(picture ? { picture } : {}),
                profile: username,
                providerIdentifier: provider,
                token,
                ...(refreshToken ? { refreshToken } : {}),
                ...(expiresIn
                    ? { tokenExpiration: new Date(Date.now() + expiresIn * 1000) }
                    : {}),
                internalId,
                organizationId: org,
                deletedAt: null,
                refreshNeeded: false,
            },
        });
        if (oneTimeToken) {
            const rootId = (await this._integration.model.integration.findFirst({
                where: {
                    organizationId: org,
                    internalId: internalId,
                },
            }))?.rootInternalId || internalId;
            await this._integration.model.integration.updateMany({
                where: {
                    id: {
                        not: upsert.id,
                    },
                    rootInternalId: rootId,
                },
                data: {
                    token,
                    refreshToken,
                    refreshNeeded: false,
                    ...(expiresIn
                        ? { tokenExpiration: new Date(Date.now() + expiresIn * 1000) }
                        : {}),
                },
            });
        }
        return this.decryptTokens(upsert);
    }
    async needsToBeRefreshed() {
        const integrations = await this._integration.model.integration.findMany({
            where: {
                tokenExpiration: {
                    lte: (0, dayjs_1.default)().add(1, 'day').toDate(),
                },
                inBetweenSteps: false,
                deletedAt: null,
                refreshNeeded: false,
            },
        });
        return Promise.all(integrations.map((p) => this.decryptTokens(p)));
    }
    async setBetweenRefreshSteps(id) {
        return this._integration.model.integration.update({
            select: {
                id: true,
            },
            where: {
                id,
            },
            data: {
                inBetweenSteps: true,
            },
        });
    }
    async refreshNeeded(org, id) {
        const { count } = await this._integration.model.integration.updateMany({
            where: {
                id,
                organizationId: org,
                refreshNeeded: false,
            },
            data: {
                refreshNeeded: true,
            },
        });
        return count === 1;
    }
    updateNameAndUrl(id, name, url) {
        return this._integration.model.integration.update({
            select: {
                id: true,
            },
            where: {
                id,
            },
            data: {
                ...(name ? { name } : {}),
                ...(url ? { picture: url } : {}),
            },
        });
    }
    async getIntegrationById(org, id) {
        return this.decryptTokens(await this._integration.model.integration.findFirst({
            where: {
                organizationId: org,
                id,
            },
        }));
    }
    async getIntegrationForOrder(id, order, user, org) {
        const integration = await this._posts.model.post.findFirst({
            where: {
                integrationId: id,
                submittedForOrder: {
                    id: order,
                    messageGroup: {
                        OR: [
                            { sellerId: user },
                            { buyerId: user },
                            { buyerOrganizationId: org },
                        ],
                    },
                },
            },
            select: {
                integration: {
                    select: {
                        id: true,
                        name: true,
                        picture: true,
                        inBetweenSteps: true,
                        providerIdentifier: true,
                    },
                },
            },
        });
        return integration?.integration;
    }
    async updateOnCustomerName(org, id, name) {
        const customer = !name
            ? undefined
            : (await this._customers.model.customer.findFirst({
                where: {
                    orgId: org,
                    name,
                },
            })) ||
                (await this._customers.model.customer.create({
                    data: {
                        name,
                        orgId: org,
                    },
                }));
        return this._integration.model.integration.update({
            select: {
                id: true,
            },
            where: {
                id,
                organizationId: org,
            },
            data: {
                customer: !customer
                    ? { disconnect: true }
                    : {
                        connect: {
                            id: customer.id,
                        },
                    },
            },
        });
    }
    updateIntegrationGroup(org, id, group) {
        return this._integration.model.integration.update({
            select: {
                id: true,
            },
            where: {
                id,
                organizationId: org,
            },
            data: !group
                ? {
                    customer: {
                        disconnect: true,
                    },
                }
                : {
                    customer: {
                        connect: {
                            id: group,
                        },
                    },
                },
        });
    }
    getCustomerByName(orgId, name) {
        return this._customers.model.customer.findFirst({
            where: {
                orgId,
                name,
                deletedAt: null,
            },
        });
    }
    updateCustomerName(orgId, id, name) {
        return this._customers.model.customer.update({
            where: {
                id,
                orgId,
            },
            data: {
                name,
            },
        });
    }
    customers(orgId) {
        return this._customers.model.customer.findMany({
            where: {
                orgId,
                deletedAt: null,
            },
        });
    }
    getIntegrationsList(org) {
        return this._integration.model.integration.findMany({
            where: {
                organizationId: org,
                deletedAt: null,
            },
            omit: {
                token: true,
                refreshToken: true,
            },
            include: {
                customer: true,
            },
        });
    }
    async latestPostsFor(org, state, field, options, groups) {
        const matches = groups.filter((group) => group.date);
        if (!matches.length) {
            return [];
        }
        return this._posts.model.post.findMany({
            where: {
                organizationId: org,
                state,
                ...(options.includeDeleted ? {} : { deletedAt: null }),
                ...(options.topLevelOnly ? { parentPostId: null } : {}),
                OR: matches.map((group) => ({
                    integrationId: group.integrationId,
                    [field]: group.date,
                })),
            },
            orderBy: {
                id: 'asc',
            },
            select: {
                id: true,
                integrationId: true,
                publishDate: true,
                updatedAt: true,
                releaseURL: true,
                error: true,
            },
        });
    }
    firstPerIntegration(posts) {
        const byIntegration = new Map();
        for (const post of posts) {
            if (!byIntegration.has(post.integrationId)) {
                byIntegration.set(post.integrationId, post);
            }
        }
        return byIntegration;
    }
    async getChannelHealth(org, includeDeleted = false) {
        const [integrations, lastPublished, lastErrored] = await Promise.all([
            this._integration.model.integration.findMany({
                where: {
                    organizationId: org,
                },
                orderBy: {
                    createdAt: 'asc',
                },
                select: {
                    id: true,
                    internalId: true,
                    name: true,
                    providerIdentifier: true,
                    type: true,
                    disabled: true,
                    refreshNeeded: true,
                    inBetweenSteps: true,
                    tokenExpiration: true,
                    deletedAt: true,
                    createdAt: true,
                    updatedAt: true,
                    customer: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
            this._posts.model.post.groupBy({
                by: ['integrationId'],
                where: {
                    organizationId: org,
                    state: 'PUBLISHED',
                    ...(includeDeleted ? {} : { deletedAt: null }),
                    parentPostId: null,
                },
                _max: { publishDate: true },
            }),
            this._posts.model.post.groupBy({
                by: ['integrationId'],
                where: {
                    organizationId: org,
                    state: 'ERROR',
                    ...(includeDeleted ? {} : { deletedAt: null }),
                },
                _max: { updatedAt: true },
            }),
        ]);
        const [publishedPosts, erroredPosts] = await Promise.all([
            this.latestPostsFor(org, 'PUBLISHED', 'publishDate', { topLevelOnly: true, includeDeleted }, lastPublished.map((group) => ({
                integrationId: group.integrationId,
                date: group._max.publishDate,
            }))),
            this.latestPostsFor(org, 'ERROR', 'updatedAt', { topLevelOnly: false, includeDeleted }, lastErrored.map((group) => ({
                integrationId: group.integrationId,
                date: group._max.updatedAt,
            }))),
        ]);
        const publishedByIntegration = this.firstPerIntegration(publishedPosts);
        const erroredByIntegration = this.firstPerIntegration(erroredPosts);
        return integrations.map((integration) => {
            const published = publishedByIntegration.get(integration.id);
            const errored = erroredByIntegration.get(integration.id);
            return {
                ...integration,
                lastPublishedAt: published?.publishDate || null,
                lastPublishedPostId: published?.id || null,
                lastPublishedUrl: published?.releaseURL || null,
                lastErrorAt: errored?.updatedAt || null,
                lastErrorPostId: errored?.id || null,
                lastError: errored?.error || null,
            };
        });
    }
    async disableChannel(org, id) {
        await this._integration.model.integration.update({
            where: {
                id,
                organizationId: org,
            },
            data: {
                disabled: true,
            },
        });
    }
    async enableChannel(org, id) {
        await this._integration.model.integration.update({
            where: {
                id,
                organizationId: org,
            },
            data: {
                disabled: false,
            },
        });
    }
    getPostsForChannel(org, id) {
        return this._posts.model.post.groupBy({
            by: ['group'],
            where: {
                organizationId: org,
                integrationId: id,
                deletedAt: null,
            },
        });
    }
    deleteChannel(org, id) {
        return this._integration.model.integration.update({
            select: {
                id: true,
            },
            where: {
                id,
                organizationId: org,
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }
    async deleteIntegrationsForAccount(org) {
        const hash = (value) => (0, crypto_1.createHash)('md5').update(value).digest('hex');
        await this._posts.model.post.updateMany({
            where: {
                organizationId: org,
                deletedAt: null,
            },
            data: {
                deletedAt: new Date(),
            },
        });
        const integrations = await this._integration.model.integration.findMany({
            where: {
                organizationId: org,
            },
        });
        for (const integration of integrations) {
            await this._integration.model.integration.update({
                where: {
                    id: integration.id,
                },
                data: {
                    name: hash(integration.name),
                    internalId: hash(integration.internalId),
                    rootInternalId: integration.rootInternalId
                        ? hash(integration.rootInternalId)
                        : null,
                    token: hash(integration.token),
                    refreshToken: integration.refreshToken
                        ? hash(integration.refreshToken)
                        : null,
                    profile: integration.profile ? hash(integration.profile) : null,
                    customInstanceDetails: integration.customInstanceDetails
                        ? hash(integration.customInstanceDetails)
                        : null,
                    picture: null,
                    deletedAt: integration.deletedAt || new Date(),
                },
            });
        }
    }
    async checkForDeletedOnceAndUpdate(org, page) {
        return this._integration.model.integration.updateMany({
            where: {
                organizationId: org,
                internalId: page,
                deletedAt: {
                    not: null,
                },
            },
            data: {
                internalId: (0, make_is_1.makeId)(10),
            },
        });
    }
    async disableIntegrations(org, totalChannels) {
        const getChannels = await this._integration.model.integration.findMany({
            where: {
                organizationId: org,
                disabled: false,
                deletedAt: null,
            },
            take: totalChannels,
            select: {
                id: true,
            },
        });
        for (const channel of getChannels) {
            await this._integration.model.integration.update({
                where: {
                    id: channel.id,
                },
                data: {
                    disabled: true,
                },
            });
        }
    }
    enableAllIntegrations(org) {
        return this._integration.model.integration.updateMany({
            where: {
                organizationId: org,
                disabled: true,
                deletedAt: null,
            },
            data: {
                disabled: false,
            },
        });
    }
    getPlugsByIntegrationId(org, id) {
        return this._plugs.model.plugs.findMany({
            where: {
                organizationId: org,
                integrationId: id,
            },
        });
    }
    createOrUpdatePlug(org, integrationId, body) {
        return this._plugs.model.plugs.upsert({
            where: {
                organizationId: org,
                plugFunction_integrationId: {
                    integrationId,
                    plugFunction: body.func,
                },
            },
            create: {
                integrationId,
                organizationId: org,
                plugFunction: body.func,
                data: JSON.stringify(body.fields),
                activated: true,
            },
            update: {
                data: JSON.stringify(body.fields),
            },
            select: {
                activated: true,
            },
        });
    }
    changePlugActivation(orgId, plugId, status) {
        return this._plugs.model.plugs.update({
            where: {
                organizationId: orgId,
                id: plugId,
            },
            data: {
                activated: !!status,
            },
        });
    }
    async loadExisingData(methodName, integrationId, id) {
        return this._exisingPlugData.model.exisingPlugData.findMany({
            where: {
                integrationId,
                methodName,
                value: {
                    in: id,
                },
            },
        });
    }
    async saveExisingData(methodName, integrationId, value) {
        return this._exisingPlugData.model.exisingPlugData.createMany({
            data: value.map((p) => ({
                integrationId,
                methodName,
                value: p,
            })),
        });
    }
    getPlainTokens(afterId) {
        return this._integration.model.integration.findMany({
            where: {
                ...(afterId ? { id: { gt: afterId } } : {}),
                OR: [
                    {
                        AND: [
                            { token: { not: '' } },
                            { token: { not: { startsWith: encryption_service_1.ENCRYPTED_PREFIX } } },
                        ],
                    },
                    {
                        AND: [
                            { refreshToken: { not: '' } },
                            { refreshToken: { not: { startsWith: encryption_service_1.ENCRYPTED_PREFIX } } },
                        ],
                    },
                ],
            },
            orderBy: {
                id: 'asc',
            },
            take: 500,
            select: {
                id: true,
                token: true,
                refreshToken: true,
                updatedAt: true,
            },
        });
    }
    async encryptStoredTokens(integration) {
        const encrypt = async (value) => !value || this._encryptionService.isEncrypted(value)
            ? value
            : this._encryptionService.encrypt(value);
        const token = (await encrypt(integration.token));
        const refreshToken = await encrypt(integration.refreshToken);
        const { count } = await this._integration.model.integration.updateMany({
            where: {
                id: integration.id,
                token: integration.token,
                refreshToken: integration.refreshToken,
            },
            data: {
                token,
                refreshToken,
                updatedAt: integration.updatedAt,
            },
        });
        return count === 1;
    }
    async getPostingTimes(orgId, integrationsId) {
        return this._integration.model.integration.findMany({
            where: {
                ...(integrationsId ? { id: integrationsId } : {}),
                organizationId: orgId,
                disabled: false,
                deletedAt: null,
            },
            select: {
                postingTimes: true,
            },
        });
    }
};
exports.IntegrationRepository = IntegrationRepository;
exports.IntegrationRepository = IntegrationRepository = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository,
        encryption_service_1.EncryptionService])
], IntegrationRepository);
//# sourceMappingURL=integration.repository.js.map