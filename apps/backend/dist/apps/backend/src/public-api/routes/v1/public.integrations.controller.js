"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicIntegrationsController = void 0;
const common_1 = require("@nestjs/common");
const multer_stream_engine_1 = require("../../../../../../libraries/nestjs-libraries/src/upload/multer.stream.engine");
const lodash_1 = require("lodash");
const swagger_1 = require("@nestjs/swagger");
const org_from_request_1 = require("../../../../../../libraries/nestjs-libraries/src/user/org.from.request");
const include_deleted_from_request_1 = require("../../../../../../libraries/nestjs-libraries/src/user/include.deleted.from.request");
const oauth_user_id_from_request_1 = require("../../../../../../libraries/nestjs-libraries/src/user/oauth.user.id.from.request");
const integration_service_1 = require("../../../../../../libraries/nestjs-libraries/src/database/prisma/integrations/integration.service");
const permissions_ability_1 = require("../../../services/auth/permissions/permissions.ability");
const posts_service_1 = require("../../../../../../libraries/nestjs-libraries/src/database/prisma/posts/posts.service");
const platform_express_1 = require("@nestjs/platform-express");
const media_service_1 = require("../../../../../../libraries/nestjs-libraries/src/database/prisma/media/media.service");
const get_posts_dto_1 = require("../../../../../../libraries/nestjs-libraries/src/dtos/posts/get.posts.dto");
const change_post_status_dto_1 = require("../../../../../../libraries/nestjs-libraries/src/dtos/posts/change.post.status.dto");
const update_post_settings_dto_1 = require("../../../../../../libraries/nestjs-libraries/src/dtos/posts/update.post.settings.dto");
const permission_exception_class_1 = require("../../../services/auth/permissions/permission.exception.class");
const video_dto_1 = require("../../../../../../libraries/nestjs-libraries/src/dtos/videos/video.dto");
const video_function_dto_1 = require("../../../../../../libraries/nestjs-libraries/src/dtos/videos/video.function.dto");
const upload_dto_1 = require("../../../../../../libraries/nestjs-libraries/src/dtos/media/upload.dto");
const get_media_dto_1 = require("../../../../../../libraries/nestjs-libraries/src/dtos/media/get.media.dto");
const clipping_dto_1 = require("../../../../../../libraries/nestjs-libraries/src/dtos/clipping/clipping.dto");
const connect_link_dto_1 = require("../../../../../../libraries/nestjs-libraries/src/dtos/integrations/connect.link.dto");
const clipping_service_1 = require("../../../../../../libraries/nestjs-libraries/src/database/prisma/clipping/clipping.service");
const notification_service_1 = require("../../../../../../libraries/nestjs-libraries/src/database/prisma/notifications/notification.service");
const get_notifications_dto_1 = require("../../../../../../libraries/nestjs-libraries/src/dtos/notifications/get.notifications.dto");
const Sentry = __importStar(require("@sentry/nestjs"));
const integration_manager_1 = require("../../../../../../libraries/nestjs-libraries/src/integrations/integration.manager");
const validation_schemas_helper_1 = require("../../../../../../libraries/nestjs-libraries/src/chat/validation.schemas.helper");
const refresh_integration_service_1 = require("../../../../../../libraries/nestjs-libraries/src/integrations/refresh.integration.service");
const social_abstract_1 = require("../../../../../../libraries/nestjs-libraries/src/integrations/social.abstract");
const posts_validation_exception_1 = require("../../../api/routes/posts.validation.exception");
const users_service_1 = require("../../../../../../libraries/nestjs-libraries/src/database/prisma/users/users.service");
const super_admin_guard_1 = require("../../../services/auth/super.admin.guard");
const timer_1 = require("../../../../../../libraries/helpers/src/utils/timer");
const redis_service_1 = require("../../../../../../libraries/nestjs-libraries/src/redis/redis.service");
const admin_stats_service_1 = require("../../../../../../libraries/nestjs-libraries/src/database/prisma/admin-stats/admin-stats.service");
const organization_service_1 = require("../../../../../../libraries/nestjs-libraries/src/database/prisma/organizations/organization.service");
const get_org_activity_dto_1 = require("../../../../../../libraries/nestjs-libraries/src/dtos/analytics/get.org.activity.dto");
const reset_credits_dto_1 = require("../../../../../../libraries/nestjs-libraries/src/dtos/billing/reset.credits.dto");
const subscription_service_1 = require("../../../../../../libraries/nestjs-libraries/src/database/prisma/subscriptions/subscription.service");
const dayjs_1 = __importDefault(require("dayjs"));
let PublicIntegrationsController = class PublicIntegrationsController {
    constructor(_integrationService, _postsService, _mediaService, _notificationService, _integrationManager, _refreshIntegrationService, _usersService, _adminStatsService, _organizationService, _clippingService, _subscriptionService) {
        this._integrationService = _integrationService;
        this._postsService = _postsService;
        this._mediaService = _mediaService;
        this._notificationService = _notificationService;
        this._integrationManager = _integrationManager;
        this._refreshIntegrationService = _refreshIntegrationService;
        this._usersService = _usersService;
        this._adminStatsService = _adminStatsService;
        this._organizationService = _organizationService;
        this._clippingService = _clippingService;
        this._subscriptionService = _subscriptionService;
    }
    async uploadSimple(org, file, adjust = 'false') {
        Sentry.metrics.count('public_api-request', 1);
        if (!file) {
            throw new common_1.HttpException({ msg: 'No file provided' }, 400);
        }
        if (adjust === 'true') {
            return this._mediaService.saveUploadedFile(org.id, file.filename, file.path);
        }
        return this._mediaService.saveFile(org.id, file.filename, file.path);
    }
    async uploadsFromUrl(org, body) {
        Sentry.metrics.count('public_api-request', 1);
        try {
            return await this._mediaService.uploadFromUrl(org.id, body.url, body.adjust);
        }
        catch (err) {
            if (err instanceof common_1.BadRequestException) {
                throw new common_1.HttpException({ msg: err.message }, 400);
            }
            throw err;
        }
    }
    async findSlotIntegration(org, id) {
        Sentry.metrics.count('public_api-request', 1);
        return { date: await this._postsService.findFreeDateTime(org.id, id) };
    }
    async getPosts(org, query) {
        Sentry.metrics.count('public_api-request', 1);
        const posts = await this._postsService.getPosts(org.id, query);
        return {
            posts,
        };
    }
    async createPost(org, rawBody) {
        Sentry.metrics.count('public_api-request', 1);
        const body = await this._postsService.mapTypeToPost({
            ...rawBody,
            posts: Array.isArray(rawBody?.posts)
                ? rawBody.posts.map((post) => (0, lodash_1.omit)(post, 'date'))
                : rawBody?.posts,
        }, org.id, rawBody?.type === 'draft' || true);
        body.type = rawBody.type;
        if (process.env.RESTRICT_UPLOAD_DOMAINS &&
            body.posts.some((p) => p.value.some((a) => a.image.some((i) => i.path.indexOf(process.env.RESTRICT_UPLOAD_DOMAINS) === -1)))) {
            throw new common_1.HttpException({
                msg: `All media must be uploaded through our upload API route and contain the domain: ${process.env.RESTRICT_UPLOAD_DOMAINS}`,
            }, 400);
        }
        const validation = await this._postsService.validatePosts(org.id, body.posts);
        const fail = (item, error) => {
            throw new posts_validation_exception_1.PostValidationException({
                provider: item.identifier,
                name: item.name,
                error,
            });
        };
        for (const item of validation) {
            if (item.emptyContent) {
                fail(item, 'Your post should have at least one character or one image.');
            }
        }
        if (body.type !== 'draft') {
            for (const item of validation) {
                if (!item.valid) {
                    fail(item, item.settingsError || 'Please fix your settings');
                }
                if (item.errors !== true) {
                    fail(item, item.errors);
                }
                if (item.tooLong) {
                    fail(item, 'post is too long, please fix it');
                }
            }
        }
        const allowedCreationMethods = ['CLI', 'API'];
        const creationMethod = allowedCreationMethods.includes(rawBody.creationMethod)
            ? rawBody.creationMethod
            : 'API';
        return this._postsService.createPost(org.id, body, creationMethod);
    }
    async deletePost(org, id) {
        Sentry.metrics.count('public_api-request', 1);
        const getPostById = await this._postsService.getPost(org.id, id);
        return this._postsService.deletePost(org.id, getPostById.group);
    }
    deletePostByGroup(org, group) {
        Sentry.metrics.count('public_api-request', 1);
        return this._postsService.deletePost(org.id, group);
    }
    async getActiveIntegrations(org) {
        Sentry.metrics.count('public_api-request', 1);
        return { connected: true };
    }
    async getMedia(org, query) {
        Sentry.metrics.count('public_api-request', 1);
        const { pages, results } = await this._mediaService.getMedia(org.id, query.page, query.search);
        return {
            pages,
            results: results.map((p) => ({
                id: p.id,
                name: p.name,
                originalName: p.originalName,
                path: p.path,
                createdAt: p.createdAt,
            })),
        };
    }
    async getMediaStatus(org, id) {
        Sentry.metrics.count('public_api-request', 1);
        return this._mediaService.getMediaUploadStatus(org.id, id);
    }
    async getMe(org, userId) {
        Sentry.metrics.count('public_api-request', 1);
        const user = userId ? await this._usersService.getPersonal(userId) : null;
        return {
            organization: { id: org.id, name: org.name },
            user: user
                ? { id: user.id, name: user.name, picture: user.picture?.path || null }
                : null,
        };
    }
    async listGroups(org) {
        Sentry.metrics.count('public_api-request', 1);
        return (await this._integrationService.customers(org.id)).map((customer) => ({
            id: customer.id,
            name: customer.name,
        }));
    }
    async listIntegration(org, group) {
        Sentry.metrics.count('public_api-request', 1);
        return (await this._integrationService.getIntegrationsList(org.id))
            .filter((integration) => !group || integration.customer?.id === group)
            .map((integration) => ({
            id: integration.id,
            name: integration.customName || integration.name,
            identifier: integration.providerIdentifier,
            picture: integration.picture,
            disabled: integration.disabled,
            profile: integration.profile,
            customer: integration.customer
                ? {
                    id: integration.customer.id,
                    name: integration.customer.name,
                }
                : undefined,
        }));
    }
    async getIntegrationUrl(integration, refresh, org) {
        Sentry.metrics.count('public_api-request', 1);
        if (!this._integrationManager
            .getAllowedSocialsIntegrations()
            .includes(integration)) {
            throw new common_1.HttpException({ msg: 'Integration not allowed' }, 400);
        }
        const migrateTo = refresh
            ? this._integrationManager.getMigrationTarget(integration)
            : undefined;
        const integrationProvider = this._integrationManager.getSocialIntegration(migrateTo || integration);
        if (integrationProvider.externalUrl) {
            throw new common_1.HttpException({
                msg: 'This integration requires an external URL and is not supported via the public API',
            }, 400);
        }
        try {
            const { codeVerifier, state, url } = await integrationProvider.generateAuthUrl();
            if (refresh) {
                const existing = await this._integrationService.getIntegrationById(org.id, refresh);
                await redis_service_1.ioRedis.set(`refresh:${state}`, existing?.internalId || refresh, 'EX', 3600);
            }
            await redis_service_1.ioRedis.set(`organization:${state}`, org.id, 'EX', 3600);
            await redis_service_1.ioRedis.set(`login:${state}`, codeVerifier, 'EX', 3600);
            return { url };
        }
        catch (err) {
            throw new common_1.HttpException({ msg: 'Failed to generate auth URL' }, 500);
        }
    }
    async createConnectLink(org, body) {
        Sentry.metrics.count('public_api-request', 1);
        try {
            return await this._integrationService.createConnectLink(org.id, body.integration, body.redirectUrl);
        }
        catch (err) {
            if (err instanceof common_1.HttpException) {
                throw new common_1.HttpException({ msg: err.message }, err.getStatus());
            }
            throw err;
        }
    }
    async listUsers(org, name) {
        Sentry.metrics.count('public_api-request', 1);
        const term = name?.trim();
        if (!term) {
            throw new common_1.HttpException({ msg: 'A search term is required' }, 400);
        }
        return this._usersService.getImpersonateUser(term);
    }
    async getPostTimeline(org, id) {
        Sentry.metrics.count('public_api-request', 1);
        const timeline = await this._postsService.getPostTimeline(id, org.id);
        if (!timeline) {
            throw new common_1.HttpException({ msg: 'Post not found' }, 404);
        }
        return timeline;
    }
    async getAccountOverview(org) {
        Sentry.metrics.count('public_api-request', 1);
        const account = await this._organizationService.getAccountOverview(org.id);
        if (!account) {
            throw new common_1.HttpException({ msg: 'Organization not found' }, 404);
        }
        return account;
    }
    async getChannelHealth(org, includeDeleted) {
        Sentry.metrics.count('public_api-request', 1);
        return this._integrationService.getChannelHealth(org.id, includeDeleted);
    }
    async getOrgActivity(org, includeDeleted, query) {
        Sentry.metrics.count('public_api-request', 1);
        const from = query.from ? (0, dayjs_1.default)(query.from) : (0, dayjs_1.default)().subtract(30, 'day');
        const to = query.to ? (0, dayjs_1.default)(query.to) : (0, dayjs_1.default)();
        return this._adminStatsService.getOrgActivity({
            organizationId: org.id,
            from: from.startOf('day').toDate(),
            to: to.endOf('day').toDate(),
            includeDeleted,
        });
    }
    async resetCredits(org, body) {
        Sentry.metrics.count('public_api-request', 1);
        const reset = await this._subscriptionService.resetCredits(org.id, body.type);
        if (!reset) {
            throw new common_1.HttpException({ msg: 'No subscription found' }, 404);
        }
        return reset;
    }
    async getNotifications(org, query) {
        Sentry.metrics.count('public_api-request', 1);
        return this._notificationService.getNotificationsPaginated(org.id, query.page ?? 0);
    }
    generateVideo(org, body) {
        Sentry.metrics.count('public_api-request', 1);
        return this._mediaService.generateVideo(org, body);
    }
    videoFunction(body) {
        Sentry.metrics.count('public_api-request', 1);
        return this._mediaService.videoFunction(body.identifier, body.functionName, body.params);
    }
    startClipping(org, body) {
        Sentry.metrics.count('public_api-request', 1);
        return this._clippingService.startClipping(org, body);
    }
    getClippings(org, page) {
        Sentry.metrics.count('public_api-request', 1);
        return this._clippingService.getClippings(org.id, page);
    }
    getClipping(org, id) {
        Sentry.metrics.count('public_api-request', 1);
        return this._clippingService.getClipping(org.id, id);
    }
    async deleteChannel(org, id) {
        Sentry.metrics.count('public_api-request', 1);
        const isTherePosts = await this._integrationService.getPostsForChannel(org.id, id);
        if (isTherePosts.length) {
            for (const post of isTherePosts) {
                this._postsService.deletePost(org.id, post.group).catch(() => { });
            }
        }
        return this._integrationService.deleteChannel(org.id, id);
    }
    async getIntegrationSettings(org, id) {
        Sentry.metrics.count('public_api-request', 1);
        const loadIntegration = await this._integrationService.getIntegrationById(org.id, id);
        if (!loadIntegration) {
            throw new common_1.HttpException({ msg: 'Integration not found' }, 404);
        }
        const verified = JSON.parse(loadIntegration.additionalSettings || '[]')?.find((p) => p?.title === 'Verified')?.value || false;
        const integration = integration_manager_1.socialIntegrationList.find((p) => p.identifier === loadIntegration.providerIdentifier);
        if (!integration) {
            return {
                output: { rules: '', maxLength: 0, settings: {}, tools: [] },
            };
        }
        const maxLength = integration.maxLength(verified);
        const schemas = !integration.dto
            ? false
            : (0, validation_schemas_helper_1.getValidationSchemas)()[integration.dto.name];
        const tools = this._integrationManager.getAllTools();
        const rules = this._integrationManager.getAllRulesDescription();
        return {
            output: {
                rules: rules[integration.identifier],
                maxLength,
                settings: !schemas ? 'No additional settings required' : schemas,
                tools: tools[integration.identifier],
            },
        };
    }
    async getMissingContent(org, id) {
        Sentry.metrics.count('public_api-request', 1);
        return this._postsService.getMissingContent(org.id, id);
    }
    async updatePostSettings(org, id, body) {
        Sentry.metrics.count('public_api-request', 1);
        return this._postsService.updatePostSettings(org.id, id, body.settings, 'API');
    }
    async changePostStatus(org, id, body) {
        Sentry.metrics.count('public_api-request', 1);
        return this._postsService.changePostStatus(org.id, id, body.status);
    }
    async updateReleaseId(org, id, releaseId) {
        Sentry.metrics.count('public_api-request', 1);
        const { batchId, ...post } = await this._postsService.updateReleaseId(org.id, id, releaseId);
        return post;
    }
    async getAnalytics(org, integration, date) {
        Sentry.metrics.count('public_api-request', 1);
        return this._integrationService.checkAnalytics(org, integration, date);
    }
    async getPostAnalytics(org, postId, date) {
        Sentry.metrics.count('public_api-request', 1);
        return this._postsService.checkPostAnalytics(org.id, postId, +date);
    }
    async triggerIntegrationTool(org, id, body) {
        Sentry.metrics.count('public_api-request', 1);
        const getIntegration = await this._integrationService.getIntegrationById(org.id, id);
        if (!getIntegration) {
            throw new common_1.HttpException({ msg: 'Integration not found' }, 404);
        }
        const integrationProvider = integration_manager_1.socialIntegrationList.find((p) => p.identifier === getIntegration.providerIdentifier);
        if (!integrationProvider) {
            throw new common_1.HttpException({ msg: 'Integration provider not found' }, 404);
        }
        const tools = this._integrationManager.getAllTools();
        if (!tools[integrationProvider.identifier]?.some((p) => p.methodName === body.methodName) ||
            !integrationProvider[body.methodName]) {
            throw new common_1.HttpException({ msg: 'Tool not found' }, 404);
        }
        while (true) {
            try {
                const result = await integrationProvider[body.methodName](getIntegration.token, body.data || {}, getIntegration.internalId, getIntegration);
                return { output: result };
            }
            catch (err) {
                if (err instanceof social_abstract_1.RefreshToken) {
                    const data = await this._refreshIntegrationService.refresh(getIntegration);
                    if (!data) {
                        await this._integrationService.disconnectChannel(org.id, getIntegration);
                        throw new common_1.HttpException({ msg: 'Channel disconnected due to expired token' }, 401);
                    }
                    const { accessToken } = data;
                    if (accessToken) {
                        getIntegration.token = accessToken;
                        if (integrationProvider.refreshWait) {
                            await (0, timer_1.timer)(10000);
                        }
                        continue;
                    }
                }
                throw new common_1.HttpException({ msg: 'Unexpected error' }, 500);
            }
        }
    }
};
exports.PublicIntegrationsController = PublicIntegrationsController;
__decorate([
    (0, common_1.Post)('/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', (0, multer_stream_engine_1.streamUploadOptions)())),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.UploadedFile)('file')),
    __param(2, (0, common_1.Body)('adjust')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "uploadSimple", null);
__decorate([
    (0, common_1.Post)('/upload-from-url'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_dto_1.UploadDto]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "uploadsFromUrl", null);
__decorate([
    (0, common_1.Get)('/find-slot/:id'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "findSlotIntegration", null);
__decorate([
    (0, common_1.Get)('/posts'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_posts_dto_1.GetPostsDto]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "getPosts", null);
__decorate([
    (0, common_1.Post)('/posts'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.POSTS_PER_MONTH]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "createPost", null);
__decorate([
    (0, common_1.Delete)('/posts/:id'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "deletePost", null);
__decorate([
    (0, common_1.Delete)('/posts/group/:group'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('group')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PublicIntegrationsController.prototype, "deletePostByGroup", null);
__decorate([
    (0, common_1.Get)('/is-connected'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "getActiveIntegrations", null);
__decorate([
    (0, common_1.Get)('/media'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_media_dto_1.GetMediaDto]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "getMedia", null);
__decorate([
    (0, common_1.Get)('/media/:id/status'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "getMediaStatus", null);
__decorate([
    (0, common_1.Get)('/me'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, oauth_user_id_from_request_1.GetOAuthUserIdFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "getMe", null);
__decorate([
    (0, common_1.Get)('/groups'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "listGroups", null);
__decorate([
    (0, common_1.Get)('/integrations'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Query)('group')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "listIntegration", null);
__decorate([
    (0, common_1.Get)('/social/:integration'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.CHANNEL]),
    __param(0, (0, common_1.Param)('integration')),
    __param(1, (0, common_1.Query)('refresh')),
    __param(2, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "getIntegrationUrl", null);
__decorate([
    (0, common_1.Post)('/integrations/connect'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.CHANNEL]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, connect_link_dto_1.ConnectLinkDto]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "createConnectLink", null);
__decorate([
    (0, common_1.Get)('/users'),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Get)('/debug/posts/:id'),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "getPostTimeline", null);
__decorate([
    (0, common_1.Get)('/debug/account'),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "getAccountOverview", null);
__decorate([
    (0, common_1.Get)('/debug/channels'),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, include_deleted_from_request_1.GetIncludeDeletedFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "getChannelHealth", null);
__decorate([
    (0, common_1.Get)('/debug/activity'),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, include_deleted_from_request_1.GetIncludeDeletedFromRequest)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean, get_org_activity_dto_1.GetOrgActivityDto]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "getOrgActivity", null);
__decorate([
    (0, common_1.Post)('/credits/reset'),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reset_credits_dto_1.ResetCreditsDto]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "resetCredits", null);
__decorate([
    (0, common_1.Get)('/notifications'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_notifications_dto_1.GetNotificationsDto]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Post)('/generate-video'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, video_dto_1.VideoDto]),
    __metadata("design:returntype", void 0)
], PublicIntegrationsController.prototype, "generateVideo", null);
__decorate([
    (0, common_1.Post)('/video/function'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [video_function_dto_1.VideoFunctionDto]),
    __metadata("design:returntype", void 0)
], PublicIntegrationsController.prototype, "videoFunction", null);
__decorate([
    (0, common_1.Post)('/clipping'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, clipping_dto_1.ClippingDto]),
    __metadata("design:returntype", void 0)
], PublicIntegrationsController.prototype, "startClipping", null);
__decorate([
    (0, common_1.Get)('/clipping'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], PublicIntegrationsController.prototype, "getClippings", null);
__decorate([
    (0, common_1.Get)('/clipping/:id'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PublicIntegrationsController.prototype, "getClipping", null);
__decorate([
    (0, common_1.Delete)('/integrations/:id'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "deleteChannel", null);
__decorate([
    (0, common_1.Get)('/integration-settings/:id'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "getIntegrationSettings", null);
__decorate([
    (0, common_1.Get)('/posts/:id/missing'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "getMissingContent", null);
__decorate([
    (0, common_1.Put)('/posts/:id/settings'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_post_settings_dto_1.UpdatePostSettingsDto]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "updatePostSettings", null);
__decorate([
    (0, common_1.Put)('/posts/:id/status'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, change_post_status_dto_1.ChangePostStatusDto]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "changePostStatus", null);
__decorate([
    (0, common_1.Put)('/posts/:id/release-id'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('releaseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "updateReleaseId", null);
__decorate([
    (0, common_1.Get)('/analytics/:integration'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('integration')),
    __param(2, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('/analytics/post/:postId'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "getPostAnalytics", null);
__decorate([
    (0, common_1.Post)('/integration-trigger/:id'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PublicIntegrationsController.prototype, "triggerIntegrationTool", null);
exports.PublicIntegrationsController = PublicIntegrationsController = __decorate([
    (0, swagger_1.ApiTags)('Public API'),
    (0, common_1.Controller)('/public/v1'),
    __metadata("design:paramtypes", [integration_service_1.IntegrationService,
        posts_service_1.PostsService,
        media_service_1.MediaService,
        notification_service_1.NotificationService,
        integration_manager_1.IntegrationManager,
        refresh_integration_service_1.RefreshIntegrationService,
        users_service_1.UsersService,
        admin_stats_service_1.AdminStatsService,
        organization_service_1.OrganizationService,
        clipping_service_1.ClippingService,
        subscription_service_1.SubscriptionService])
], PublicIntegrationsController);
//# sourceMappingURL=public.integrations.controller.js.map