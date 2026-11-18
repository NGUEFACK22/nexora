"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("@gitroom/helpers/auth/auth.service");
const redis_service_1 = require("@gitroom/nestjs-libraries/redis/redis.service");
const integration_manager_1 = require("@gitroom/nestjs-libraries/integrations/integration.manager");
const organization_service_1 = require("@gitroom/nestjs-libraries/database/prisma/organizations/organization.service");
const integration_service_1 = require("@gitroom/nestjs-libraries/database/prisma/integrations/integration.service");
const posts_service_1 = require("@gitroom/nestjs-libraries/database/prisma/posts/posts.service");
let EnterpriseController = class EnterpriseController {
    constructor(_integrationManager, _organizationService, _integrationService, _postsService) {
        this._integrationManager = _integrationManager;
        this._organizationService = _organizationService;
        this._integrationService = _integrationService;
        this._postsService = _postsService;
    }
    verifyEnterpriseToken(params) {
        const payload = auth_service_1.AuthService.verifyJWT(params);
        if (!payload || typeof payload !== 'object' ||
            'providerName' in payload ||
            'orgId' in payload ||
            'expires' in payload) {
            throw new Error('Invalid enterprise token');
        }
        return payload;
    }
    async createUser(params) {
        try {
            const { id, name, saasName, email } = this.verifyEnterpriseToken(params);
            if (!id || !saasName) {
                return { success: false };
            }
            try {
                return await this._organizationService.createMaxUser(id, name, saasName, email);
            }
            catch (err) {
                return { create: false };
            }
        }
        catch (err) {
            return { success: false };
        }
    }
    async redirectParams(params) {
        try {
            const load = this.verifyEnterpriseToken(params);
            if (!load ||
                !load.redirectUrl ||
                !load.apiKey ||
                typeof load.apiKey !== 'string' ||
                !load.provider) {
                return;
            }
            const org = await this._organizationService.getOrgByApiKey(load.apiKey);
            if (!org) {
                throw new Error('Organization not found');
            }
            if (!this._integrationManager
                .getAllowedSocialsIntegrations()
                .includes(load.provider)) {
                throw new Error('Integration not allowed');
            }
            const integrationProvider = this._integrationManager.getSocialIntegration(load.provider);
            const { codeVerifier, state, url } = await integrationProvider.generateAuthUrl();
            if (load.refreshId) {
                await redis_service_1.ioRedis.set(`refresh:${state}`, load.refreshId, 'EX', 3600);
            }
            await redis_service_1.ioRedis.set(`webhookUrl:${state}`, load.webhookUrl, 'EX', 3600);
            await redis_service_1.ioRedis.set(`redirect:${state}`, load.redirectUrl, 'EX', 3600);
            await redis_service_1.ioRedis.set(`organization:${state}`, org.id, 'EX', 3600);
            await redis_service_1.ioRedis.set(`login:${state}`, codeVerifier, 'EX', 3600);
            return url;
        }
        catch (err) { }
    }
    async deleteChannel(params) {
        try {
            const load = this.verifyEnterpriseToken(params);
            if (!load ||
                !load.apiKey ||
                !load.id ||
                typeof load.apiKey !== 'string' ||
                typeof load.id !== 'string') {
                return { success: false };
            }
            const org = await this._organizationService.getOrgByApiKey(load.apiKey);
            if (!org) {
                return { success: false };
            }
            const isTherePosts = await this._integrationService.getPostsForChannel(org.id, load.id);
            if (isTherePosts.length) {
                for (const post of isTherePosts) {
                    this._postsService.deletePost(org.id, post.group).catch(() => { });
                }
            }
            await this._integrationService.deleteChannel(org.id, load.id);
            return { success: true };
        }
        catch (err) {
            return { success: false };
        }
    }
};
exports.EnterpriseController = EnterpriseController;
tslib_1.__decorate([
    (0, common_1.Post)('/create-user'),
    tslib_1.__param(0, (0, common_1.Body)('params')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], EnterpriseController.prototype, "createUser", null);
tslib_1.__decorate([
    (0, common_1.Post)('/url'),
    tslib_1.__param(0, (0, common_1.Body)('params')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], EnterpriseController.prototype, "redirectParams", null);
tslib_1.__decorate([
    (0, common_1.Post)('/delete-channel'),
    tslib_1.__param(0, (0, common_1.Body)('params')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], EnterpriseController.prototype, "deleteChannel", null);
exports.EnterpriseController = EnterpriseController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('Enterprise'),
    (0, common_1.Controller)('/enterprise'),
    tslib_1.__metadata("design:paramtypes", [integration_manager_1.IntegrationManager,
        organization_service_1.OrganizationService,
        integration_service_1.IntegrationService,
        posts_service_1.PostsService])
], EnterpriseController);
//# sourceMappingURL=enterprise.controller.js.map