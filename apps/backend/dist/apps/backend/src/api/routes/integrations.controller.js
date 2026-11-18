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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsController = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../../../../libraries/nestjs-libraries/src/redis/redis.service");
const integration_manager_1 = require("../../../../../libraries/nestjs-libraries/src/integrations/integration.manager");
const integration_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/integrations/integration.service");
const org_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/org.from.request");
const integration_function_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/integrations/integration.function.dto");
const permissions_ability_1 = require("../../services/auth/permissions/permissions.ability");
const pricing_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/subscriptions/pricing");
const swagger_1 = require("@nestjs/swagger");
const user_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/user.from.request");
const posts_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/posts/posts.service");
const integration_time_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/integrations/integration.time.dto");
const integration_name_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/integrations/integration.name.dto");
const customer_name_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/integrations/customer.name.dto");
const plug_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/plugs/plug.dto");
const social_abstract_1 = require("../../../../../libraries/nestjs-libraries/src/integrations/social.abstract");
const timer_1 = require("../../../../../libraries/helpers/src/utils/timer");
const telegram_provider_1 = require("../../../../../libraries/nestjs-libraries/src/integrations/social/telegram.provider");
const moltbook_provider_1 = require("../../../../../libraries/nestjs-libraries/src/integrations/social/moltbook.provider");
const permission_exception_class_1 = require("../../services/auth/permissions/permission.exception.class");
const lodash_1 = require("lodash");
const refresh_integration_service_1 = require("../../../../../libraries/nestjs-libraries/src/integrations/refresh.integration.service");
let IntegrationsController = class IntegrationsController {
    constructor(_integrationManager, _integrationService, _postService, _refreshIntegrationService) {
        this._integrationManager = _integrationManager;
        this._integrationService = _integrationService;
        this._postService = _postService;
        this._refreshIntegrationService = _refreshIntegrationService;
    }
    async saveProviderPage(org, id, body) {
        return this._integrationService.saveProviderPage(org.id, id, body);
    }
    getInternalPlugs(identifier) {
        return this._integrationManager.getInternalPlugs(identifier);
    }
    getCustomers(org) {
        return this._integrationService.customers(org.id);
    }
    async updateCustomerName(org, id, body) {
        return this._integrationService.updateCustomerName(org.id, id, body.name);
    }
    async updateIntegrationGroup(org, id, body) {
        return this._integrationService.updateIntegrationGroup(org.id, id, body.group);
    }
    async updateOnCustomerName(org, id, body) {
        return this._integrationService.updateOnCustomerName(org.id, id, body.name);
    }
    async updateCustomName(org, id, body) {
        return this._integrationService.updateCustomName(org.id, id, body.name);
    }
    async getIntegrationList(org) {
        return {
            integrations: await Promise.all((await this._integrationService.getIntegrationsList(org.id)).map(async (p) => {
                const findIntegration = this._integrationManager.getSocialIntegration(p.providerIdentifier);
                return {
                    name: p.customName || p.name,
                    originalName: p.name,
                    id: p.id,
                    internalId: p.internalId,
                    disabled: p.disabled,
                    editor: findIntegration.editor,
                    stripLinks: !!findIntegration?.stripLinks?.(),
                    picture: p.picture || '/no-picture.jpg',
                    identifier: p.providerIdentifier,
                    inBetweenSteps: p.inBetweenSteps,
                    refreshNeeded: p.refreshNeeded,
                    isCustomFields: !!findIntegration.customFields,
                    isChromeExtension: !!findIntegration.isChromeExtension,
                    ...(findIntegration.customFields
                        ? { customFields: await findIntegration.customFields() }
                        : {}),
                    display: p.profile,
                    type: p.type,
                    time: JSON.parse(p.postingTimes),
                    changeProfilePicture: !!findIntegration?.changeProfilePicture,
                    changeNickName: !!findIntegration?.changeNickname,
                    customer: p.customer,
                    additionalSettings: p.additionalSettings || '[]',
                };
            })),
        };
    }
    async updateProviderSettings(org, id, body) {
        if (typeof body !== 'string') {
            throw new Error('Invalid body');
        }
        await this._integrationService.updateProviderSettings(org.id, id, body);
    }
    async setNickname(org, id, body) {
        const integration = await this._integrationService.getIntegrationById(org.id, id);
        if (!integration) {
            throw new Error('Invalid integration');
        }
        const manager = this._integrationManager.getSocialIntegration(integration.providerIdentifier);
        if (!manager.changeProfilePicture && !manager.changeNickname) {
            throw new Error('Invalid integration');
        }
        const { url } = manager.changeProfilePicture
            ? await manager.changeProfilePicture(integration.internalId, integration.token, body.picture)
            : { url: '' };
        const { name } = manager.changeNickname
            ? await manager.changeNickname(integration.internalId, integration.token, body.name)
            : { name: '' };
        return this._integrationService.updateNameAndUrl(id, name, url);
    }
    getSingleIntegration(id, order, user, org) {
        return this._integrationService.getIntegrationForOrder(id, order, user.id, org.id);
    }
    async getIntegrationUrl(integration, refresh, externalUrl, redirectUrl, onboarding, org) {
        if (!this._integrationManager
            .getAllowedSocialsIntegrations()
            .includes(integration)) {
            throw new Error('Integration not allowed');
        }
        const migrateTo = refresh
            ? this._integrationManager.getMigrationTarget(integration)
            : undefined;
        const integrationProvider = this._integrationManager.getSocialIntegration(migrateTo || integration);
        if (integrationProvider.externalUrl && !externalUrl) {
            throw new Error('Missing external url');
        }
        try {
            const getExternalUrl = integrationProvider.externalUrl
                ? {
                    ...(await integrationProvider.externalUrl(externalUrl)),
                    instanceUrl: externalUrl,
                }
                : undefined;
            const { codeVerifier, state, url } = await integrationProvider.generateAuthUrl(getExternalUrl);
            if (refresh) {
                await redis_service_1.ioRedis.set(`refresh:${state}`, refresh, 'EX', 3600);
            }
            if (onboarding === 'true') {
                await redis_service_1.ioRedis.set(`onboarding:${state}`, 'true', 'EX', 3600);
            }
            if (redirectUrl) {
                await redis_service_1.ioRedis.set(`redirect:${state}`, redirectUrl, 'EX', 3600);
            }
            await redis_service_1.ioRedis.set(`organization:${state}`, org.id, 'EX', 3600);
            await redis_service_1.ioRedis.set(`login:${state}`, codeVerifier, 'EX', 3600);
            await redis_service_1.ioRedis.set(`external:${state}`, JSON.stringify(getExternalUrl), 'EX', 3600);
            return { url };
        }
        catch (err) {
            return { err: true };
        }
    }
    async setTime(org, id, body) {
        return this._integrationService.setTimes(org.id, id, body);
    }
    async mentions(org, body) {
        const getIntegration = await this._integrationService.getIntegrationById(org.id, body.id);
        if (!getIntegration) {
            throw new Error('Invalid integration');
        }
        let newList = [];
        try {
            newList =
                (await this.functionIntegration(org, { ...body, name: 'mention' })) ||
                    [];
        }
        catch (err) {
            console.log(err);
        }
        if (!Array.isArray(newList) && newList?.none) {
            return newList;
        }
        const list = await this._integrationService.getMentions(getIntegration.providerIdentifier, body?.data?.query);
        if (Array.isArray(newList) && newList.length) {
            await this._integrationService.insertMentions(getIntegration.providerIdentifier, newList
                .map((p) => ({
                name: p.label || '',
                username: p.id || '',
                image: p.image || '',
                doNotCache: p.doNotCache || false,
            }))
                .filter((f) => f.name && !f.doNotCache));
        }
        return (0, lodash_1.uniqBy)([
            ...list.map((p) => ({
                id: p.username,
                image: p.image,
                label: p.name,
            })),
            ...newList,
        ], (p) => p.id).filter((f) => f.label && f.id);
    }
    async functionIntegration(org, body) {
        const getIntegration = await this._integrationService.getIntegrationById(org.id, body.id);
        if (!getIntegration) {
            throw new Error('Invalid integration');
        }
        const integrationProvider = this._integrationManager.getSocialIntegration(getIntegration.providerIdentifier);
        if (!integrationProvider) {
            throw new Error('Invalid provider');
        }
        if (this._integrationManager.isDashboardCallable(integrationProvider, body.name)) {
            try {
                const load = await integrationProvider[body.name](getIntegration.token, body.data, getIntegration.internalId, getIntegration);
                return load;
            }
            catch (err) {
                if (err instanceof social_abstract_1.Disconnect) {
                    await this._integrationService.disconnectChannel(org.id, getIntegration);
                    return false;
                }
                if (err instanceof social_abstract_1.RefreshToken) {
                    const data = await this._refreshIntegrationService.refresh(getIntegration);
                    if (!data) {
                        return;
                    }
                    const { accessToken } = data;
                    if (accessToken) {
                        if (integrationProvider.refreshWait) {
                            await (0, timer_1.timer)(10000);
                        }
                        return this.functionIntegration(org, body);
                    }
                    return false;
                }
                return false;
            }
        }
        throw new Error('Function not found');
    }
    disableChannel(org, id) {
        return this._integrationService.disableChannel(org.id, id);
    }
    enableChannel(org, id) {
        return this._integrationService.enableChannel(org.id, org?.subscription?.totalChannels || pricing_1.pricing.FREE.channel, id);
    }
    async deleteChannel(org, id) {
        const isTherePosts = await this._integrationService.getPostsForChannel(org.id, id);
        if (isTherePosts.length) {
            for (const post of isTherePosts) {
                this._postService.deletePost(org.id, post.group).catch((err) => { });
            }
        }
        return this._integrationService.deleteChannel(org.id, id);
    }
    async getPlugList() {
        return { plugs: this._integrationManager.getAllPlugs() };
    }
    async getPlugsByIntegrationId(id, org) {
        return this._integrationService.getPlugsByIntegrationId(org.id, id);
    }
    async postPlugsByIntegrationId(id, org, body) {
        return this._integrationService.createOrUpdatePlug(org.id, id, body);
    }
    async changePlugActivation(id, org, status) {
        return this._integrationService.changePlugActivation(org.id, id, status);
    }
    async getUpdates(query) {
        return new telegram_provider_1.TelegramProvider().getBotId(query);
    }
    async moltbookRegister(body) {
        try {
            const provider = new moltbook_provider_1.MoltbookProvider();
            const result = await provider.registerAgent(body.name, body.description);
            return {
                apiKey: result.api_key,
                claimUrl: result.claim_url,
                verificationCode: result.verification_code,
            };
        }
        catch (err) {
            return { error: err.message || 'Registration failed' };
        }
    }
    async moltbookStatus(apiKey) {
        try {
            const provider = new moltbook_provider_1.MoltbookProvider();
            const result = await provider.checkAgentStatus(apiKey);
            return { claimed: result?.status === 'claimed' };
        }
        catch (err) {
            return { claimed: false };
        }
    }
};
exports.IntegrationsController = IntegrationsController;
__decorate([
    (0, common_1.Post)('/provider/:id/connect'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.CHANNEL]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "saveProviderPage", null);
__decorate([
    (0, common_1.Get)('/:identifier/internal-plugs'),
    __param(0, (0, common_1.Param)('identifier')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "getInternalPlugs", null);
__decorate([
    (0, common_1.Get)('/customers'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "getCustomers", null);
__decorate([
    (0, common_1.Put)('/customers/:id'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, customer_name_dto_1.CustomerNameDto]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "updateCustomerName", null);
__decorate([
    (0, common_1.Put)('/:id/group'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "updateIntegrationGroup", null);
__decorate([
    (0, common_1.Put)('/:id/customer-name'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "updateOnCustomerName", null);
__decorate([
    (0, common_1.Put)('/:id/custom-name'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, integration_name_dto_1.IntegrationNameDto]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "updateCustomName", null);
__decorate([
    (0, common_1.Get)('/list'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getIntegrationList", null);
__decorate([
    (0, common_1.Post)('/:id/settings'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('additionalSettings')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "updateProviderSettings", null);
__decorate([
    (0, common_1.Post)('/:id/nickname'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "setNickname", null);
__decorate([
    (0, common_1.Get)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('order')),
    __param(2, (0, user_from_request_1.GetUserFromRequest)()),
    __param(3, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "getSingleIntegration", null);
__decorate([
    (0, common_1.Get)('/social/:integration'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.CHANNEL]),
    __param(0, (0, common_1.Param)('integration')),
    __param(1, (0, common_1.Query)('refresh')),
    __param(2, (0, common_1.Query)('externalUrl')),
    __param(3, (0, common_1.Query)('redirectUrl')),
    __param(4, (0, common_1.Query)('onboarding')),
    __param(5, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getIntegrationUrl", null);
__decorate([
    (0, common_1.Post)('/:id/time'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, integration_time_dto_1.IntegrationTimeDto]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "setTime", null);
__decorate([
    (0, common_1.Post)('/mentions'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, integration_function_dto_1.IntegrationFunctionDto]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "mentions", null);
__decorate([
    (0, common_1.Post)('/function'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, integration_function_dto_1.IntegrationFunctionDto]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "functionIntegration", null);
__decorate([
    (0, common_1.Post)('/disable'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "disableChannel", null);
__decorate([
    (0, common_1.Post)('/enable'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], IntegrationsController.prototype, "enableChannel", null);
__decorate([
    (0, common_1.Delete)('/'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "deleteChannel", null);
__decorate([
    (0, common_1.Get)('/plug/list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getPlugList", null);
__decorate([
    (0, common_1.Get)('/:id/plugs'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getPlugsByIntegrationId", null);
__decorate([
    (0, common_1.Post)('/:id/plugs'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, plug_dto_1.PlugDto]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "postPlugsByIntegrationId", null);
__decorate([
    (0, common_1.Put)('/plugs/:id/activate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Boolean]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "changePlugActivation", null);
__decorate([
    (0, common_1.Get)('/telegram/updates'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getUpdates", null);
__decorate([
    (0, common_1.Post)('/moltbook/register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "moltbookRegister", null);
__decorate([
    (0, common_1.Get)('/moltbook/status'),
    __param(0, (0, common_1.Query)('apiKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "moltbookStatus", null);
exports.IntegrationsController = IntegrationsController = __decorate([
    (0, swagger_1.ApiTags)('Integrations'),
    (0, common_1.Controller)('/integrations'),
    __metadata("design:paramtypes", [integration_manager_1.IntegrationManager,
        integration_service_1.IntegrationService,
        posts_service_1.PostsService,
        refresh_integration_service_1.RefreshIntegrationService])
], IntegrationsController);
//# sourceMappingURL=integrations.controller.js.map