"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const integration_repository_1 = require("@gitroom/nestjs-libraries/database/prisma/integrations/integration.repository");
const integration_manager_1 = require("@gitroom/nestjs-libraries/integrations/integration.manager");
const notification_service_1 = require("@gitroom/nestjs-libraries/database/prisma/notifications/notification.service");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const timer_1 = require("@gitroom/helpers/utils/timer");
const redis_service_1 = require("@gitroom/nestjs-libraries/redis/redis.service");
const social_abstract_1 = require("@gitroom/nestjs-libraries/integrations/social.abstract");
const upload_factory_1 = require("@gitroom/nestjs-libraries/upload/upload.factory");
const lodash_1 = require("lodash");
const utc_1 = tslib_1.__importDefault(require("dayjs/plugin/utc"));
const autopost_repository_1 = require("@gitroom/nestjs-libraries/database/prisma/autopost/autopost.repository");
const refresh_integration_service_1 = require("@gitroom/nestjs-libraries/integrations/refresh.integration.service");
const nestjs_temporal_core_1 = require("nestjs-temporal-core");
const crypto_1 = require("crypto");
const common_2 = require("@temporalio/common");
const encryption_service_1 = require("@gitroom/nestjs-libraries/services/encryption.service");
dayjs_1.default.extend(utc_1.default);
let IntegrationService = class IntegrationService {
    constructor(_integrationRepository, _autopostsRepository, _integrationManager, _notificationService, _refreshIntegrationService, _temporalService, _encryptionService) {
        this._integrationRepository = _integrationRepository;
        this._autopostsRepository = _autopostsRepository;
        this._integrationManager = _integrationManager;
        this._notificationService = _notificationService;
        this._refreshIntegrationService = _refreshIntegrationService;
        this._temporalService = _temporalService;
        this._encryptionService = _encryptionService;
        this.storage = upload_factory_1.UploadFactory.createStorage();
    }
    async changeActiveCron(orgId) {
        const data = await this._autopostsRepository.getAutoposts(orgId);
        for (const item of data.filter((f) => f.active)) {
            try {
                await this._temporalService.terminateWorkflow(`autopost-${item.id}`);
            }
            catch (err) { }
        }
        return true;
    }
    getMentions(platform, q) {
        return this._integrationRepository.getMentions(platform, q);
    }
    insertMentions(platform, mentions) {
        return this._integrationRepository.insertMentions(platform, mentions);
    }
    async setTimes(orgId, integrationId, times) {
        return this._integrationRepository.setTimes(orgId, integrationId, times);
    }
    updateProviderSettings(org, id, additionalSettings) {
        return this._integrationRepository.updateProviderSettings(org, id, additionalSettings);
    }
    checkPreviousConnections(org, id) {
        return this._integrationRepository.checkPreviousConnections(org, id);
    }
    async createOrUpdateIntegration(additionalSettings, oneTimeToken, org, name, picture, type, internalId, provider, token, refreshToken = '', expiresIn, username, isBetweenSteps = false, refresh, timezone, customInstanceDetails) {
        const uploadedPicture = picture
            ? picture?.indexOf('imagedelivery.net') > -1
                ? picture
                : await this.storage.uploadSimple(picture).catch((err) => {
                    console.log('Failed to upload profile picture:', picture, err);
                    return undefined;
                })
            : undefined;
        return this._integrationRepository.createOrUpdateIntegration(additionalSettings, oneTimeToken, org, name, uploadedPicture, type, internalId, provider, token, refreshToken, expiresIn, username, isBetweenSteps, refresh, timezone, customInstanceDetails);
    }
    updateIntegrationGroup(org, id, group) {
        return this._integrationRepository.updateIntegrationGroup(org, id, group);
    }
    updateOnCustomerName(org, id, name) {
        return this._integrationRepository.updateOnCustomerName(org, id, name);
    }
    getIntegrationsList(org) {
        return this._integrationRepository.getIntegrationsList(org);
    }
    getChannelHealth(org, includeDeleted = false) {
        return this._integrationRepository.getChannelHealth(org, includeDeleted);
    }
    getIntegrationForOrder(id, order, user, org) {
        return this._integrationRepository.getIntegrationForOrder(id, order, user, org);
    }
    updateCustomName(org, id, name) {
        return this._integrationRepository.updateCustomName(org, id, name);
    }
    updateNameAndUrl(id, name, url) {
        return this._integrationRepository.updateNameAndUrl(id, name, url);
    }
    getIntegrationById(org, id) {
        return this._integrationRepository.getIntegrationById(org, id);
    }
    getIntegrationByInternalId(org, internalId) {
        return this._integrationRepository.getIntegrationByInternalId(org, internalId);
    }
    async refreshToken(provider, refresh) {
        try {
            const { refreshToken, accessToken, expiresIn } = await provider.refreshToken(refresh);
            if (!refreshToken || !accessToken || !expiresIn) {
                return false;
            }
            return { refreshToken, accessToken, expiresIn };
        }
        catch (e) {
            return false;
        }
    }
    async disconnectChannel(orgId, integration, err = '') {
        await this._integrationRepository.disconnectChannel(orgId, integration.id);
        await this.informAboutRefreshError(orgId, integration, err);
    }
    async migrateIntegration(org, oldInternalId, newProvider, auth) {
        const existing = await this._integrationRepository.getIntegrationByInternalId(org, oldInternalId);
        if (!existing ||
            this._integrationManager.getMigrationTarget(existing.providerIdentifier) !== newProvider) {
            throw new social_abstract_1.NotEnoughScopes('Please refresh the channel that needs to be refreshed');
        }
        const oldProvider = this._integrationManager.getSocialIntegration(existing.providerIdentifier);
        if (!oldProvider.migrationMatch(auth, existing)) {
            throw new social_abstract_1.NotEnoughScopes(`Please connect the same account (@${existing.profile}) that needs to be refreshed`);
        }
        if (await this._integrationRepository.getIntegrationByInternalId(org, auth.id)) {
            throw new social_abstract_1.NotEnoughScopes('This account is already connected as another channel, please delete one of them first');
        }
        return this._integrationRepository.migrateIntegration(org, existing.id, auth.id, newProvider, existing.rootInternalId === existing.internalId
            ? auth.id
            : existing.rootInternalId);
    }
    async migrateIntegrationOnConnect(org, newProvider, auth) {
        const sources = this._integrationManager.getMigrationSources(newProvider);
        if (!sources.length ||
            this._integrationManager.getSocialIntegration(newProvider).isBetweenSteps) {
            return;
        }
        if (await this._integrationRepository.getIntegrationByInternalId(org, auth.id)) {
            return;
        }
        const existing = (await this._integrationRepository.getIntegrationsList(org)).find((p) => sources.includes(p.providerIdentifier) &&
            this._integrationManager
                .getSocialIntegration(p.providerIdentifier)
                .migrationMatch(auth, p));
        if (!existing) {
            return;
        }
        return this._integrationRepository.migrateIntegration(org, existing.id, auth.id, newProvider, existing.rootInternalId === existing.internalId
            ? auth.id
            : existing.rootInternalId);
    }
    async informAboutRefreshError(orgId, integration, err = '') {
        await this._notificationService.inAppNotification(orgId, `Could not refresh your ${integration.providerIdentifier} channel`, `Could not refresh your ${integration.providerIdentifier} channel ${err}. Please go back to the system and connect it again ${process.env.FRONTEND_URL}/launches`, true, false, 'info');
    }
    async refreshNeeded(org, id) {
        return this._integrationRepository.refreshNeeded(org, id);
    }
    async setBetweenRefreshSteps(id) {
        return this._integrationRepository.setBetweenRefreshSteps(id);
    }
    async refreshTokens() {
        const integrations = await this._integrationRepository.needsToBeRefreshed();
        for (const integration of integrations) {
            const provider = this._integrationManager.getSocialIntegration(integration.providerIdentifier);
            const data = await this.refreshToken(provider, integration.refreshToken);
            if (!data) {
                const flagged = await this._integrationRepository.refreshNeeded(integration.organizationId, integration.id);
                if (flagged) {
                    await this.informAboutRefreshError(integration.organizationId, integration);
                }
                continue;
            }
            const { refreshToken, accessToken, expiresIn } = data;
            await this.createOrUpdateIntegration(undefined, !!provider.oneTimeToken, integration.organizationId, integration.name, undefined, 'social', integration.internalId, integration.providerIdentifier, accessToken, refreshToken, expiresIn);
        }
    }
    async disableChannel(org, id) {
        return this._integrationRepository.disableChannel(org, id);
    }
    async enableChannel(org, totalChannels, id) {
        const integrations = (await this._integrationRepository.getIntegrationsList(org)).filter((f) => !f.disabled);
        if (!!process.env.STRIPE_PUBLISHABLE_KEY &&
            integrations.length >= totalChannels) {
            throw new Error('You have reached the maximum number of channels');
        }
        return this._integrationRepository.enableChannel(org, id);
    }
    async getPostsForChannel(org, id) {
        return this._integrationRepository.getPostsForChannel(org, id);
    }
    async deleteChannel(org, id) {
        return this._integrationRepository.deleteChannel(org, id);
    }
    async disableIntegrations(org, totalChannels) {
        return this._integrationRepository.disableIntegrations(org, totalChannels);
    }
    async enableAllIntegrations(org) {
        return this._integrationRepository.enableAllIntegrations(org);
    }
    async checkForDeletedOnceAndUpdate(org, page) {
        return this._integrationRepository.checkForDeletedOnceAndUpdate(org, page);
    }
    async saveProviderPage(org, id, data) {
        const getIntegration = await this._integrationRepository.getIntegrationById(org, id);
        if (!getIntegration) {
            throw new common_1.HttpException('Integration not found', common_1.HttpStatus.NOT_FOUND);
        }
        if (!getIntegration.inBetweenSteps) {
            throw new common_1.HttpException('Invalid request', common_1.HttpStatus.BAD_REQUEST);
        }
        const provider = this._integrationManager.getSocialIntegration(getIntegration.providerIdentifier);
        if (!provider.fetchPageInformation) {
            throw new common_1.HttpException('Provider does not support page selection', common_1.HttpStatus.BAD_REQUEST);
        }
        const getIntegrationInformation = await provider.fetchPageInformation(getIntegration.token, data);
        await this.checkForDeletedOnceAndUpdate(org, String(getIntegrationInformation.id));
        await this._integrationRepository.updateIntegration(id, {
            picture: getIntegrationInformation.picture,
            internalId: String(getIntegrationInformation.id),
            organizationId: org,
            name: getIntegrationInformation.name,
            inBetweenSteps: false,
            token: getIntegrationInformation.access_token,
            profile: getIntegrationInformation.username,
        });
        return { success: true };
    }
    async createConnectLink(org, integration, redirectUrl) {
        if (!this._integrationManager
            .getAllowedSocialsIntegrations()
            .includes(integration) ||
            this._integrationManager.isHiddenProvider(integration)) {
            throw new common_1.HttpException('Integration not allowed', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!this._integrationManager
            .getLinkableSocialsIntegrations()
            .includes(integration)) {
            throw new common_1.HttpException('This integration cannot be connected with a link', common_1.HttpStatus.BAD_REQUEST);
        }
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        await redis_service_1.ioRedis.set(`connectLink:${token}`, JSON.stringify({
            org,
            integration,
            redirectUrl,
            redirectTo: redirectUrl
                ? this.connectLinkRedirectHost(redirectUrl)
                : undefined,
        }), 'EX', 3600);
        return { url: `${process.env.FRONTEND_URL}/integrations/connect/${token}` };
    }
    connectLinkRedirectHost(redirectUrl) {
        try {
            const { protocol, host } = new URL(redirectUrl);
            if (['http:', 'https:'].includes(protocol) &&
                !redirectUrl.includes('#')) {
                return host;
            }
        }
        catch (err) { }
        throw new common_1.HttpException('The redirect URL must be an http(s) URL without a fragment', common_1.HttpStatus.BAD_REQUEST);
    }
    async loadConnectLink(token) {
        const link = JSON.parse((await redis_service_1.ioRedis.get(`connectLink:${token}`)) || 'null');
        if (!link) {
            throw new common_1.HttpException('This connection link expired, please ask for a new one', common_1.HttpStatus.NOT_FOUND);
        }
        return link;
    }
    async getConnectLinkOrganization(token) {
        return (await this.loadConnectLink(token)).org;
    }
    async getConnectLink(token) {
        const { integration, redirectTo } = await this.loadConnectLink(token);
        const provider = this._integrationManager.getSocialIntegration(integration);
        return {
            identifier: provider.identifier,
            name: provider.name,
            ...(redirectTo ? { redirectTo } : {}),
        };
    }
    async startConnectLink(token) {
        const { org, integration, redirectUrl } = await this.loadConnectLink(token);
        const provider = this._integrationManager.getSocialIntegration(integration);
        try {
            const { codeVerifier, state, url } = await provider.generateAuthUrl();
            await redis_service_1.ioRedis.set(`organization:${state}`, org, 'EX', 3600);
            await redis_service_1.ioRedis.set(`login:${state}`, codeVerifier, 'EX', 3600);
            if (redirectUrl) {
                await redis_service_1.ioRedis.set(`redirect:${state}`, redirectUrl, 'EX', 3600);
            }
            return { url };
        }
        catch (err) {
            throw new common_1.HttpException('Failed to generate auth URL', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async checkAnalytics(org, integration, date, forceRefresh = false) {
        const days = Number(date) > 0 ? Number(date) : 7;
        const getIntegration = await this.getIntegrationById(org.id, integration);
        if (!getIntegration) {
            throw new Error('Invalid integration');
        }
        if (getIntegration.type !== 'social') {
            return [];
        }
        const integrationProvider = this._integrationManager.getSocialIntegration(getIntegration.providerIdentifier);
        if ((0, dayjs_1.default)(getIntegration?.tokenExpiration).isBefore((0, dayjs_1.default)()) ||
            forceRefresh) {
            const data = await this._refreshIntegrationService.refresh(getIntegration);
            if (!data) {
                return [];
            }
            const { accessToken } = data;
            if (accessToken) {
                getIntegration.token = accessToken;
                if (integrationProvider.refreshWait) {
                    await (0, timer_1.timer)(10000);
                }
            }
            else {
                await this.disconnectChannel(org.id, getIntegration);
                return [];
            }
        }
        const getIntegrationData = await redis_service_1.ioRedis.get(`integration:${org.id}:${integration}:${days}`);
        if (getIntegrationData) {
            return JSON.parse(getIntegrationData);
        }
        if (integrationProvider.analytics) {
            try {
                const loadAnalytics = await integrationProvider.analytics(getIntegration.internalId, getIntegration.token, days);
                await redis_service_1.ioRedis.set(`integration:${org.id}:${integration}:${days}`, JSON.stringify(loadAnalytics), 'EX', !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
                    ? 1
                    : 3600);
                return loadAnalytics;
            }
            catch (e) {
                if (e instanceof social_abstract_1.RefreshToken) {
                    return this.checkAnalytics(org, integration, date, true);
                }
            }
        }
        return [];
    }
    customers(orgId) {
        return this._integrationRepository.customers(orgId);
    }
    async updateCustomerName(orgId, id, name) {
        const exists = await this._integrationRepository.getCustomerByName(orgId, name);
        if (exists && exists.id !== id) {
            throw new common_1.HttpException('A group with this name already exists', common_1.HttpStatus.BAD_REQUEST);
        }
        return this._integrationRepository.updateCustomerName(orgId, id, name);
    }
    getPlugsByIntegrationId(org, integrationId) {
        return this._integrationRepository.getPlugsByIntegrationId(org, integrationId);
    }
    async processInternalPlug(data, forceRefresh = false) {
        const originalIntegration = await this._integrationRepository.getIntegrationById(data.orgId, data.originalIntegration);
        const getIntegration = await this._integrationRepository.getIntegrationById(data.orgId, data.integration);
        if (!getIntegration || !originalIntegration) {
            return;
        }
        const getAllInternalPlugs = this._integrationManager
            .getInternalPlugs(getIntegration.providerIdentifier)
            .internalPlugs.find((p) => p.identifier === data.plugName);
        if (!getAllInternalPlugs) {
            return;
        }
        const getSocialIntegration = this._integrationManager.getSocialIntegration(getIntegration.providerIdentifier);
        await getSocialIntegration?.[getAllInternalPlugs.methodName]?.(getIntegration, originalIntegration, data.post, data.information);
        return;
    }
    async processPlugs(data) {
        const getPlugById = await this._integrationRepository.getPlug(data.plugId);
        if (!getPlugById) {
            return true;
        }
        const integration = this._integrationManager.getSocialIntegration(getPlugById.integration.providerIdentifier);
        const process = await integration[getPlugById.plugFunction](getPlugById.integration, data.postId, JSON.parse(getPlugById.data).reduce((all, current) => {
            all[current.name] = current.value;
            return all;
        }, {}));
        if (process) {
            return true;
        }
        if (data.totalRuns === data.currentRun) {
            return true;
        }
        return false;
    }
    async createOrUpdatePlug(orgId, integrationId, body) {
        const { activated } = await this._integrationRepository.createOrUpdatePlug(orgId, integrationId, body);
        return {
            activated,
        };
    }
    async changePlugActivation(orgId, plugId, status) {
        const { id, integrationId, plugFunction } = await this._integrationRepository.changePlugActivation(orgId, plugId, status);
        return { id };
    }
    async getPlugs(orgId, integrationId) {
        return this._integrationRepository.getPlugs(orgId, integrationId);
    }
    async loadExisingData(methodName, integrationId, id) {
        const exisingData = await this._integrationRepository.loadExisingData(methodName, integrationId, id);
        const loadOnlyIds = exisingData.map((p) => p.value);
        return (0, lodash_1.difference)(id, loadOnlyIds);
    }
    async decryptTokens(integration) {
        return integration
            ? this._encryptionService.decryptFields(integration, encryption_service_1.integrationEncryptedFields)
            : integration;
    }
    async encryptStoredTokens(afterId) {
        if (!this._encryptionService.canEncrypt()) {
            throw common_2.ApplicationFailure.nonRetryable('The encryption is off, set ENCRYPTION_PROVIDER and remove ENCRYPTION_READ_ONLY');
        }
        const integrations = await this._integrationRepository.getPlainTokens(afterId);
        let changed = 0;
        let failed = 0;
        for (const integration of integrations) {
            try {
                if (await this._integrationRepository.encryptStoredTokens(integration)) {
                    changed++;
                }
            }
            catch (err) {
                failed++;
                console.error(`Could not encrypt the stored tokens of integration ${integration.id}:`, err?.message);
            }
        }
        return {
            changed,
            failed,
            lastId: integrations[integrations.length - 1]?.id,
        };
    }
    async findFreeDateTime(orgId, integrationsId) {
        const findTimes = await this._integrationRepository.getPostingTimes(orgId, integrationsId);
        return (0, lodash_1.uniq)(findTimes.reduce((all, current) => {
            return [
                ...all,
                ...JSON.parse(current.postingTimes).map((p) => p.time),
            ];
        }, []));
    }
};
exports.IntegrationService = IntegrationService;
exports.IntegrationService = IntegrationService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => refresh_integration_service_1.RefreshIntegrationService))),
    tslib_1.__metadata("design:paramtypes", [integration_repository_1.IntegrationRepository,
        autopost_repository_1.AutopostRepository,
        integration_manager_1.IntegrationManager,
        notification_service_1.NotificationService,
        refresh_integration_service_1.RefreshIntegrationService,
        nestjs_temporal_core_1.TemporalService,
        encryption_service_1.EncryptionService])
], IntegrationService);
//# sourceMappingURL=integration.service.js.map