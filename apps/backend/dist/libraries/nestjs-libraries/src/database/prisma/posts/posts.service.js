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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const posts_repository_1 = require("./posts.repository");
const create_post_dto_1 = require("../../../dtos/posts/create.post.dto");
const dayjs_1 = __importDefault(require("dayjs"));
const integration_manager_1 = require("../../../integrations/integration.manager");
const lodash_1 = require("lodash");
const uuid_1 = require("uuid");
const integration_service_1 = require("../integrations/integration.service");
const make_is_1 = require("../../../services/make.is");
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const media_service_1 = require("../media/media.service");
const short_link_service_1 = require("../../../short-linking/short.link.service");
const posts_list_minify_1 = require("../../../../../helpers/src/utils/posts.list.minify");
const ssrf_safe_dispatcher_1 = require("../../../dtos/webhooks/ssrf.safe.dispatcher");
const sharp_1 = __importDefault(require("sharp"));
const upload_factory_1 = require("../../../upload/upload.factory");
const stream_1 = require("stream");
const path_1 = require("path");
const openai_service_1 = require("../../../openai/openai.service");
dayjs_1.default.extend(utc_1.default);
const Sentry = __importStar(require("@sentry/nestjs"));
const nestjs_temporal_core_1 = require("nestjs-temporal-core");
const common_2 = require("@temporalio/common");
const temporal_search_attribute_1 = require("../../../temporal/temporal.search.attribute");
const timer_1 = require("../../../../../helpers/src/utils/timer");
const redis_service_1 = require("../../../redis/redis.service");
const social_abstract_1 = require("../../../integrations/social.abstract");
const refresh_integration_service_1 = require("../../../integrations/refresh.integration.service");
const has_extension_1 = require("../../../../../helpers/src/utils/has.extension");
const strip_links_1 = require("../../../../../helpers/src/utils/strip.links");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const strip_html_validation_1 = require("../../../../../helpers/src/utils/strip.html.validation");
const sanitize_post_content_1 = require("../../../../../helpers/src/utils/sanitize.post.content");
const count_length_1 = require("../../../../../helpers/src/utils/count.length");
let PostsService = class PostsService {
    constructor(_postRepository, _integrationManager, _integrationService, _mediaService, _shortLinkService, _openaiService, _temporalService, _refreshIntegrationService) {
        this._postRepository = _postRepository;
        this._integrationManager = _integrationManager;
        this._integrationService = _integrationService;
        this._mediaService = _mediaService;
        this._shortLinkService = _shortLinkService;
        this._openaiService = _openaiService;
        this._temporalService = _temporalService;
        this._refreshIntegrationService = _refreshIntegrationService;
        this.storage = upload_factory_1.UploadFactory.createStorage();
    }
    searchForMissingThreeHoursPosts() {
        return this._postRepository.searchForMissingThreeHoursPosts();
    }
    getPostState(id) {
        return this._postRepository.getPostState(id);
    }
    updatePost(id, postId, releaseURL) {
        return this._postRepository.updatePost(id, postId, releaseURL);
    }
    updateResolvedRelease(id, orgId, releaseId, releaseURL) {
        return this._postRepository.updateResolvedRelease(id, orgId, releaseId, releaseURL);
    }
    async getMissingContent(orgId, postId, forceRefresh = false) {
        const post = await this._postRepository.getPostById(postId, orgId);
        if (!post || post.releaseId !== 'missing') {
            return [];
        }
        const integrationProvider = this._integrationManager.getSocialIntegration(post.integration.providerIdentifier);
        if (!integrationProvider.missing) {
            return [];
        }
        const getIntegration = post.integration;
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
                await this._integrationService.disconnectChannel(orgId, getIntegration);
                return [];
            }
        }
        try {
            return await integrationProvider.missing(getIntegration.internalId, getIntegration.token);
        }
        catch (e) {
            console.log(e);
            if (e instanceof social_abstract_1.RefreshToken) {
                return this.getMissingContent(orgId, postId, true);
            }
        }
        return [];
    }
    async getPostById(postId, orgId) {
        return this._postRepository.getPostById(postId, orgId);
    }
    async getPostTimeline(postId, orgId) {
        return this._postRepository.getPostTimeline(postId, orgId);
    }
    async updateReleaseId(orgId, postId, releaseId) {
        const post = await this._postRepository.getPostById(postId, orgId);
        let releaseURL;
        if (post?.releaseId === 'missing') {
            try {
                releaseURL = await this._integrationManager
                    .getSocialIntegration(post.integration.providerIdentifier)
                    .releaseUrl?.(post.integration.token, String(releaseId), post.integration);
            }
            catch (e) {
                console.log(e);
            }
        }
        return this._postRepository.updateReleaseId(postId, orgId, releaseId, releaseURL);
    }
    async resolveRelease(orgId, post) {
        const integrationProvider = this._integrationManager.getSocialIntegration(post.integration.providerIdentifier);
        const resolved = await integrationProvider.resolveReleaseId?.(post.integration.token, post.releaseId, post.integration, JSON.parse(post.settings || '{}'), post.releaseURL);
        if (!resolved ||
            !('postId' in resolved) ||
            resolved.postId === post.releaseId) {
            return {
                releaseId: post.releaseId,
                releaseURL: post.releaseURL,
                pending: !!resolved && 'pending' in resolved,
                unavailable: !!resolved && 'unavailable' in resolved,
            };
        }
        await this._postRepository.updateResolvedRelease(post.id, orgId, resolved.postId, resolved.releaseURL);
        return {
            releaseId: resolved.postId,
            releaseURL: resolved.releaseURL,
            pending: false,
            unavailable: false,
        };
    }
    async getReleaseURL(orgId, postId, forceRefresh = false) {
        const post = await this._postRepository.getPostById(postId, orgId);
        if (!post || !post.releaseURL) {
            return { releaseURL: '' };
        }
        const integrationProvider = this._integrationManager.getSocialIntegration(post.integration.providerIdentifier);
        if (!integrationProvider.resolveReleaseId) {
            return { releaseURL: post.releaseURL };
        }
        const getIntegration = post.integration;
        if (forceRefresh) {
            const data = await this._refreshIntegrationService.refresh(getIntegration);
            if (!data) {
                return { releaseURL: post.releaseURL, reconnect: true };
            }
            const { accessToken } = data;
            if (accessToken) {
                getIntegration.token = accessToken;
                if (integrationProvider.refreshWait) {
                    await (0, timer_1.timer)(10000);
                }
            }
            else {
                await this._integrationService.disconnectChannel(orgId, getIntegration);
                return { releaseURL: post.releaseURL, reconnect: true };
            }
        }
        try {
            const { releaseURL, pending, unavailable } = await this.resolveRelease(orgId, post);
            return { releaseURL, pending, unavailable };
        }
        catch (e) {
            console.log(e);
            if (e instanceof social_abstract_1.RefreshToken && !forceRefresh) {
                return this.getReleaseURL(orgId, postId, true);
            }
        }
        return { releaseURL: post.releaseURL, pending: true };
    }
    async checkPostAnalytics(orgId, postId, date, forceRefresh = false) {
        const post = await this._postRepository.getPostById(postId, orgId);
        if (!post || !post.releaseId) {
            return [];
        }
        if (post.releaseId === 'missing') {
            return { missing: true };
        }
        const integrationProvider = this._integrationManager.getSocialIntegration(post.integration.providerIdentifier);
        if (!integrationProvider.postAnalytics) {
            return [];
        }
        const getIntegration = post.integration;
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
                await this._integrationService.disconnectChannel(orgId, getIntegration);
                return [];
            }
        }
        try {
            const { releaseId } = await this.resolveRelease(orgId, post);
            const loadAnalytics = await integrationProvider.postAnalytics(getIntegration.internalId, getIntegration.token, releaseId, date);
            await redis_service_1.ioRedis.set(`integration:${orgId}:${post.id}:${date}`, JSON.stringify(loadAnalytics), 'EX', !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
                ? 1
                : 3600);
            return loadAnalytics;
        }
        catch (e) {
            if (e instanceof social_abstract_1.RefreshToken && !forceRefresh) {
                return this.checkPostAnalytics(orgId, postId, date, true);
            }
            console.log(e);
        }
        return [];
    }
    async getStatistics(orgId, id) {
        const getPost = await this.getPostsRecursively(id, true, orgId, true);
        const content = getPost.map((p) => p.content);
        const shortLinksTracking = await this._shortLinkService.getStatistics(content);
        return {
            clicks: shortLinksTracking,
        };
    }
    async mapTypeToPost(body, organization, replaceDraft = false) {
        if (!body?.posts?.every((p) => p?.integration?.id)) {
            throw new common_1.BadRequestException('All posts must have an integration id');
        }
        const mappedValues = {
            ...body,
            type: replaceDraft ? 'schedule' : body?.type,
            posts: await Promise.all(body?.posts?.map(async (post) => {
                const integration = await this._integrationService.getIntegrationById(organization, post.integration.id);
                if (!integration) {
                    throw new common_1.BadRequestException(`Integration with id ${post.integration.id} not found`);
                }
                return {
                    type: replaceDraft ? 'schedule' : body?.type,
                    ...post,
                    settings: {
                        ...(post.settings || {}),
                        __type: integration.providerIdentifier,
                    },
                };
            }) || []),
        };
        const validationPipe = new common_1.ValidationPipe({
            skipMissingProperties: false,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        });
        return await validationPipe.transform(mappedValues, {
            type: 'body',
            metatype: create_post_dto_1.CreatePostDto,
        });
    }
    async getPostsRecursively(id, includeIntegration = false, orgId, isFirst) {
        const post = await this._postRepository.getPost(id, includeIntegration, orgId, isFirst);
        if (!post) {
            return [];
        }
        return [
            post,
            ...(post?.childrenPost?.length
                ? await this.getPostsRecursively(post?.childrenPost?.[0]?.id, false, orgId, false)
                : []),
        ];
    }
    async getPosts(orgId, query) {
        return this._postRepository.getPosts(orgId, query);
    }
    async getPostsMinified(orgId, query) {
        return (0, posts_list_minify_1.minifyPosts)({
            posts: await this._postRepository.getPosts(orgId, query),
        });
    }
    async getPostsList(orgId, query) {
        return (0, posts_list_minify_1.minifyPostsList)(await this._postRepository.getPostsList(orgId, query));
    }
    async updateMedia(id, imagesList, convertToJPEG = false) {
        try {
            let imageUpdateNeeded = false;
            const getImageList = await Promise.all((await Promise.all((imagesList || []).map(async (p) => {
                if (!p.id) {
                    return p;
                }
                if (!p.path) {
                    imageUpdateNeeded = true;
                    return this._mediaService.getMediaById(p.id);
                }
                const fresh = await this._mediaService.getMediaById(p.id);
                if (fresh?.status === 'ready' && fresh.path !== p.path) {
                    imageUpdateNeeded = true;
                    return { ...p, name: fresh.name, path: fresh.path };
                }
                return p;
            })))
                .filter((m) => this.isAllowedMediaPath(m?.path))
                .map((m) => {
                return {
                    ...m,
                    url: m.path.indexOf('http') === -1
                        ? process.env.FRONTEND_URL +
                            '/' +
                            process.env.NEXT_PUBLIC_UPLOAD_STATIC_DIRECTORY +
                            m.path
                        : m.path,
                    type: 'image',
                    path: m.path.indexOf('http') === -1
                        ? process.env.UPLOAD_DIRECTORY + m.path
                        : m.path,
                };
            })
                .map(async (m) => {
                if (!convertToJPEG) {
                    return m;
                }
                if ((0, has_extension_1.hasExtension)(m.path, 'png')) {
                    imageUpdateNeeded = true;
                    const response = await (0, ssrf_safe_dispatcher_1.getSsrfSafeAxios)().get(m.url, {
                        responseType: 'arraybuffer',
                    });
                    const imageBuffer = Buffer.from(response.data);
                    const buffer = await (0, sharp_1.default)(imageBuffer)
                        .jpeg({ quality: 100 })
                        .toBuffer();
                    const { path, originalname } = await this.storage.uploadFile({
                        buffer,
                        mimetype: 'image/jpeg',
                        size: buffer.length,
                        path: '',
                        fieldname: '',
                        destination: '',
                        stream: new stream_1.Readable(),
                        filename: '',
                        originalname: '',
                        encoding: '',
                    });
                    return {
                        ...m,
                        name: originalname,
                        url: path.indexOf('http') === -1
                            ? process.env.FRONTEND_URL +
                                '/' +
                                process.env.NEXT_PUBLIC_UPLOAD_STATIC_DIRECTORY +
                                path
                            : path,
                        type: 'image',
                        path: path.indexOf('http') === -1
                            ? process.env.UPLOAD_DIRECTORY + path
                            : path,
                    };
                }
                return m;
            }));
            if (imageUpdateNeeded) {
                await this._postRepository.updateImages(id, JSON.stringify(getImageList));
            }
            return getImageList;
        }
        catch (err) {
            return (imagesList || []).filter((m) => this.isAllowedMediaPath(m?.path));
        }
    }
    isAllowedMediaPath(path) {
        if (typeof path !== 'string' || /^https?:\/\//.test(path)) {
            return true;
        }
        if (path.indexOf('http') > -1) {
            return false;
        }
        const base = (0, path_1.resolve)(String(process.env.UPLOAD_DIRECTORY));
        const filePath = (0, path_1.resolve)(process.env.UPLOAD_DIRECTORY + path);
        return filePath.startsWith(base + path_1.sep);
    }
    async getPostGroupDebugExport(orgId, group) {
        const loadAll = await this._postRepository.getPostsByGroup(orgId, group);
        const errors = await this._postRepository.getErrorsByPostIds(loadAll.map((p) => p.id));
        const posts = this.arrangePostsByGroup(loadAll, undefined);
        const rootPost = posts[0];
        return {
            type: 'draft',
            shortLink: false,
            date: rootPost.publishDate.toISOString(),
            tags: rootPost.tags?.map((t) => ({
                value: t.tag.id,
                label: t.tag.name,
            })) || [],
            posts: [
                {
                    integration: { id: 'REPLACE_WITH_LOCAL_INTEGRATION_ID' },
                    group: rootPost.group,
                    settings: JSON.parse(rootPost.settings || '{}'),
                    value: posts.map((post) => ({
                        content: post.content,
                        image: JSON.parse(post.image || '[]'),
                        delay: post.delay || 0,
                    })),
                },
            ],
            _debug: {
                providerIdentifier: rootPost.integration?.providerIdentifier,
                providerName: rootPost.integration?.name,
                state: rootPost.state,
                error: rootPost.error,
                errors: errors.map((e) => ({
                    message: e.message,
                    platform: e.platform,
                    body: e.body,
                    createdAt: e.createdAt,
                })),
                originalGroup: group,
                originalPublishDate: rootPost.publishDate,
                exportedAt: new Date().toISOString(),
            },
        };
    }
    async getPostsByGroup(orgId, group) {
        const loadAll = await this._postRepository.getPostsByGroup(orgId, group);
        const posts = this.arrangePostsByGroup(loadAll, undefined);
        if (!posts.length) {
            throw new common_1.NotFoundException('Post not found');
        }
        const batch = posts[0].batchId
            ? await this._postRepository.getPostsByBatch(orgId, posts[0].batchId, group)
            : [];
        const siblings = (0, lodash_1.uniqBy)(Object.values((0, lodash_1.groupBy)(batch, (post) => post.group))
            .map((batchPosts) => this.arrangePostsByGroup(batchPosts, undefined))
            .filter((batchPosts) => batchPosts.length &&
            batchPosts[0].integrationId !== posts[0].integrationId &&
            batchPosts[0].intervalInDays === posts[0].intervalInDays), (batchPosts) => batchPosts[0].integrationId);
        return {
            ...(await this.groupForEditor(posts)),
            siblings: await Promise.all(siblings.map((batchPosts) => this.groupForEditor(batchPosts))),
        };
    }
    async groupForEditor(posts, convertToJPEG = false) {
        return {
            group: posts?.[0]?.group,
            posts: await Promise.all((posts || []).map(async ({ integration, ...post }) => ({
                ...post,
                ...(integration
                    ? {
                        integration: {
                            id: integration.id,
                            name: integration.name,
                            picture: integration.picture,
                            providerIdentifier: integration.providerIdentifier,
                            profile: integration.profile,
                        },
                    }
                    : {}),
                image: await this.updateMedia(post.id, JSON.parse(post.image || '[]'), convertToJPEG),
            }))),
            integrationPicture: posts[0]?.integration?.picture,
            integration: posts[0].integrationId,
            settings: JSON.parse(posts[0].settings || '{}'),
        };
    }
    arrangePostsByGroup(all, parent) {
        const findAll = all
            .filter((p) => !parent ? !p.parentPostId : p.parentPostId === parent)
            .map(({ integration, ...all }) => ({
            ...all,
            ...(!parent ? { integration } : {}),
        }));
        return [
            ...findAll,
            ...(findAll.length
                ? findAll.flatMap((p) => this.arrangePostsByGroup(all, p.id))
                : []),
        ];
    }
    async getPost(orgId, id, convertToJPEG = false) {
        const posts = await this.getPostsRecursively(id, true, orgId, true);
        if (!posts?.[0]) {
            throw new common_1.NotFoundException('Post not found');
        }
        return this.groupForEditor(posts, convertToJPEG);
    }
    async getOldPosts(orgId, date) {
        return this._postRepository.getOldPosts(orgId, date);
    }
    async updateTags(orgId, post) {
        const plainText = JSON.stringify(post);
        const extract = Array.from(plainText.match(/\(post:[a-zA-Z0-9-_]+\)/g) || []);
        if (!extract.length) {
            return post;
        }
        const ids = (extract || []).map((e) => e.replace('(post:', '').replace(')', ''));
        const urls = await this._postRepository.getPostUrls(orgId, ids);
        const replaceTags = (text, escape = (url) => url) => ids.reduce((acc, value) => {
            const findUrl = urls?.find?.((u) => u.id === value)?.releaseURL || '';
            return acc.replace(new RegExp(`\\(post:${value}\\)`, 'g'), () => escape(findUrl.split(',')[0]));
        }, text);
        return post.map((p) => ({
            ...p,
            content: p.content && replaceTags(p.content),
            settings: p.settings &&
                replaceTags(p.settings, (url) => JSON.stringify(url).slice(1, -1)),
        }));
    }
    async checkInternalPlug(integration, orgId, id, settings) {
        const plugs = Object.entries(settings).filter(([key]) => {
            return key.indexOf('plug-') > -1;
        });
        if (plugs.length === 0) {
            return [];
        }
        const parsePlugs = plugs.reduce((all, [key, value]) => {
            const [_, name, identifier] = key.split('--');
            all[name] = all[name] || { name };
            all[name][identifier] = value;
            return all;
        }, {});
        const list = Object.values(parsePlugs);
        return (list || []).flatMap((trigger) => {
            return (trigger?.integrations || []).flatMap((int) => ({
                type: 'internal-plug',
                post: id,
                originalIntegration: integration.id,
                integration: int.id,
                plugName: trigger.name,
                orgId: orgId,
                delay: +trigger.delay,
                information: trigger,
            }));
        });
    }
    async checkPlugs(orgId, providerName, integrationId) {
        const loadAllPlugs = this._integrationManager.getAllPlugs();
        const getPlugs = await this._integrationService.getPlugs(orgId, integrationId);
        const currentPlug = loadAllPlugs.find((p) => p.identifier === providerName);
        return getPlugs
            .filter((plug) => {
            return currentPlug?.plugs?.some((p) => p.methodName === plug.plugFunction);
        })
            .map((plug) => {
            const runPlug = currentPlug?.plugs?.find((p) => p.methodName === plug.plugFunction);
            return {
                type: 'global',
                plugId: plug.id,
                delay: runPlug.runEveryMilliseconds,
                totalRuns: runPlug.totalRuns,
            };
        });
    }
    async deletePost(orgId, group) {
        const post = await this._postRepository.deletePost(orgId, group);
        if (post?.id) {
            try {
                const workflows = this._temporalService.client
                    .getRawClient()
                    ?.workflow.list({
                    query: `postId="${post.id}" AND ExecutionStatus="Running"`,
                });
                for await (const executionInfo of workflows) {
                    try {
                        const workflow = await this._temporalService.client.getWorkflowHandle(executionInfo.workflowId);
                        if (workflow &&
                            (await workflow.describe()).status.name !== 'TERMINATED') {
                            await workflow.terminate();
                        }
                    }
                    catch (err) { }
                }
            }
            catch (err) { }
            return { id: post.id };
        }
        return { error: true };
    }
    async countPostsFromDay(orgId, date) {
        return this._postRepository.countPostsFromDay(orgId, date);
    }
    getPostByForWebhookId(id, integrationId) {
        return this._postRepository.getPostByForWebhookId(id, integrationId);
    }
    async startWorkflow(taskQueue, postId, orgId, state) {
        try {
            const workflows = this._temporalService.client
                .getRawClient()
                ?.workflow.list({
                query: `postId="${postId}" AND ExecutionStatus="Running"`,
            });
            for await (const executionInfo of workflows) {
                try {
                    const workflow = await this._temporalService.client.getWorkflowHandle(executionInfo.workflowId);
                    if (workflow &&
                        (await workflow.describe()).status.name !== 'TERMINATED') {
                        await workflow.terminate();
                    }
                }
                catch (err) { }
            }
        }
        catch (err) { }
        if (state === 'DRAFT') {
            return;
        }
        try {
            await this._temporalService.client
                .getRawClient()
                ?.workflow.start('postWorkflowV112', {
                workflowId: `post_${postId}`,
                taskQueue: 'main',
                workflowIdConflictPolicy: 'TERMINATE_EXISTING',
                args: [
                    {
                        taskQueue: taskQueue,
                        postId: postId,
                        organizationId: orgId,
                    },
                ],
                typedSearchAttributes: new common_2.TypedSearchAttributes([
                    {
                        key: temporal_search_attribute_1.postId,
                        value: postId,
                    },
                    {
                        key: temporal_search_attribute_1.organizationId,
                        value: orgId,
                    },
                ]),
            });
        }
        catch (err) { }
    }
    async validatePosts(orgId, posts) {
        return Promise.all((posts || []).map(async (post) => {
            const integration = await this._integrationService.getIntegrationById(orgId, post?.integration?.id);
            if (!integration) {
                throw new common_1.BadRequestException(`Integration with id ${post?.integration?.id} not found`);
            }
            const provider = this._integrationManager.getSocialIntegration(integration.providerIdentifier);
            let additionalSettings = [];
            try {
                additionalSettings = JSON.parse(integration.additionalSettings || '[]');
            }
            catch {
                additionalSettings = [];
            }
            const settings = post.settings || {};
            const media = (post.value || []).map((p) => p.image || []);
            let valid = true;
            let settingsError = '';
            if (provider?.dto) {
                const instance = (0, class_transformer_1.plainToInstance)(provider.dto, settings, {
                    enableImplicitConversion: false,
                });
                const validationErrors = await (0, class_validator_1.validate)(instance, {
                    skipMissingProperties: false,
                });
                settingsError = this.firstValidationError(validationErrors);
                valid = validationErrors.length === 0;
            }
            let errors = true;
            try {
                errors = await provider.checkValidity(media, settings, additionalSettings);
            }
            catch (err) {
                errors = err?.message || 'Invalid media';
            }
            const maximumCharacters = provider.maxLength(additionalSettings, settings);
            const emptyContent = (post.value || []).some((a) => {
                const strip = (0, strip_html_validation_1.stripHtmlValidation)('normal', a.content || '', true);
                const length = (0, count_length_1.countLength)(integration.providerIdentifier, strip);
                return length === 0 && (a.image || []).length === 0;
            });
            const tooLong = (post.value || []).some((a) => {
                const strip = (0, strip_html_validation_1.stripHtmlValidation)('normal', a.content || '', true);
                const counted = (0, count_length_1.countLength)(integration.providerIdentifier, strip);
                return counted > (maximumCharacters || 1000000);
            });
            return {
                id: integration.id,
                identifier: integration.providerIdentifier,
                name: integration.name,
                valid,
                settingsError,
                errors,
                emptyContent,
                tooLong,
                maximumCharacters,
            };
        }));
    }
    firstValidationError(errors) {
        for (const e of errors || []) {
            if (e?.constraints) {
                return Object.values(e.constraints)[0] || '';
            }
            const child = e?.children?.length
                ? this.firstValidationError(e.children)
                : '';
            if (child) {
                return child;
            }
        }
        return '';
    }
    async createPost(orgId, body, creationMethod, keepGroup = false) {
        const postList = [];
        const batchId = (0, uuid_1.v4)();
        for (const post of body.posts) {
            const postIds = [
                ...new Set((post.value || []).map((p) => p.id).filter(Boolean)),
            ];
            if (postIds.length &&
                (await this._postRepository.countPostsOfOtherOrganizations(orgId, postIds))) {
                throw new common_1.NotFoundException('Post not found');
            }
            const provider = this._integrationManager.getSocialIntegration(post.settings?.__type);
            const removeLinks = !!provider?.stripLinks?.();
            const messages = (post.value || []).map((p) => p.content);
            const updateContent = !body.shortLink || removeLinks
                ? messages
                : await this._shortLinkService.convertTextToShortLinks(orgId, messages);
            post.value = (post.value || []).map((p, i) => ({
                ...p,
                content: removeLinks ? (0, strip_links_1.stripLinks)(updateContent[i]) : updateContent[i],
            }));
            const { posts } = await this._postRepository.createOrUpdatePost(body.type, orgId, body.type === 'now'
                ? (0, dayjs_1.default)().format('YYYY-MM-DDTHH:mm:00')
                : post.date || body.date, post, body.tags, creationMethod, body.inter, keepGroup, batchId);
            if (!posts?.length) {
                return [];
            }
            const existingIds = (post.value || []).map((p) => p.id).filter(Boolean);
            await this.detachStaleAnchors(posts.filter((p) => existingIds.includes(p.id)));
            if (body.type !== 'update') {
                this.startWorkflow(post.settings.__type.split('-')[0].toLowerCase(), posts[0].id, orgId, posts[0].state).catch((err) => { });
            }
            Sentry.metrics.count('post_created', 1);
            postList.push({
                postId: posts[0].id,
                integration: post.integration.id,
            });
        }
        return postList;
    }
    async updatePostSettings(orgId, postId, settings, creationMethod) {
        const ordered = await this.getPostsRecursively(postId, true, orgId, true);
        const [root] = ordered;
        if (!root) {
            throw new common_1.NotFoundException('Post not found');
        }
        if (root.parentPostId) {
            throw new common_1.BadRequestException('This id belongs to a comment, pass the id of the main post');
        }
        if (root.state !== 'QUEUE' && root.state !== 'DRAFT') {
            throw new common_1.BadRequestException('Only scheduled posts that were not published yet (or drafts) can be updated');
        }
        if (root.state === 'QUEUE' &&
            dayjs_1.default.utc(root.publishDate).isBefore(dayjs_1.default.utc())) {
            throw new common_1.BadRequestException('The publish time of this post already passed, it cannot be updated');
        }
        const integration = root.integration;
        let existingSettings;
        try {
            existingSettings = JSON.parse(root.settings || '{}');
        }
        catch (err) {
            existingSettings = {};
        }
        const mergedSettings = {
            ...existingSettings,
            ...(settings || {}),
            __type: integration.providerIdentifier,
        };
        const value = ordered.map((p) => {
            let image = [];
            try {
                image = JSON.parse(p.image || '[]');
            }
            catch (err) { }
            return {
                id: p.id,
                content: p.content,
                delay: p.delay || 0,
                image,
            };
        });
        const [validation] = await this.validatePosts(orgId, [
            {
                integration: { id: integration.id },
                settings: mergedSettings,
                value: value.map((p) => ({ content: p.content, image: p.image })),
            },
        ]);
        if (validation.emptyContent) {
            throw new common_1.BadRequestException(`${validation.name}: Your post should have at least one character or one image.`);
        }
        if (root.state !== 'DRAFT') {
            if (!validation.valid) {
                throw new common_1.BadRequestException(`${validation.name}: ${validation.settingsError || 'Please fix your settings'}`);
            }
            if (validation.errors !== true) {
                throw new common_1.BadRequestException(`${validation.name}: ${validation.errors}`);
            }
            if (validation.tooLong) {
                throw new common_1.BadRequestException(`${validation.name}: The maximum characters is ${validation.maximumCharacters}`);
            }
        }
        const date = dayjs_1.default.utc(root.publishDate).format('YYYY-MM-DDTHH:mm:ss');
        const [output] = await this.createPost(orgId, {
            date,
            type: 'update',
            shortLink: false,
            tags: (root.tags || []).map((t) => ({
                value: t.tag.name,
                label: t.tag.name,
            })),
            posts: [
                {
                    integration,
                    group: root.group,
                    settings: mergedSettings,
                    value,
                },
            ],
        }, creationMethod, true);
        if (!output) {
            throw new common_1.BadRequestException('Failed to update the post');
        }
        return {
            postId: output.postId,
            publishDate: date,
        };
    }
    async separatePosts(content, len) {
        return this._openaiService.separatePosts(content, len);
    }
    async changeState(id, state, err, body) {
        return this._postRepository.changeState(id, state, err, body);
    }
    async changePostStatus(orgId, id, status) {
        const getPostById = await this._postRepository.getPostById(id, orgId);
        if (!getPostById) {
            throw new common_1.BadRequestException('Post not found');
        }
        const state = status === 'draft' ? 'DRAFT' : 'QUEUE';
        await this._postRepository.changeState(id, state);
        try {
            await this.startWorkflow(getPostById.integration.providerIdentifier.split('-')[0].toLowerCase(), getPostById.id, orgId, state);
        }
        catch (err) { }
        return { id, state };
    }
    async changeDate(orgId, id, date, action = 'schedule') {
        const getPostById = await this._postRepository.getPostById(id, orgId);
        const newDate = await this._postRepository.changeDate(orgId, id, date, getPostById.state === 'DRAFT', action);
        if (action === 'schedule') {
            try {
                await this.startWorkflow(getPostById.integration.providerIdentifier
                    .split('-')[0]
                    .toLowerCase(), getPostById.id, orgId, getPostById.state === 'DRAFT' ? 'DRAFT' : 'QUEUE');
            }
            catch (err) { }
        }
        return newDate;
    }
    async generatePostsDraft(orgId, body) {
        const getAllIntegrations = (await this._integrationService.getIntegrationsList(orgId)).filter((f) => !f.disabled && f.providerIdentifier !== 'reddit');
        const allDates = (0, dayjs_1.default)()
            .isoWeek(body.week)
            .year(body.year)
            .startOf('isoWeek');
        const dates = [...new Array(7)].map((_, i) => {
            return allDates.add(i, 'day').format('YYYY-MM-DD');
        });
        const findTime = () => {
            const totalMinutes = Math.floor(Math.random() * 144) * 10;
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            const formattedHours = hours.toString().padStart(2, '0');
            const formattedMinutes = minutes.toString().padStart(2, '0');
            const randomDate = (0, lodash_1.shuffle)(dates)[0] + 'T' + `${formattedHours}:${formattedMinutes}:00`;
            if ((0, dayjs_1.default)(randomDate).isBefore((0, dayjs_1.default)())) {
                return findTime();
            }
            return randomDate;
        };
        for (const integration of getAllIntegrations) {
            for (const toPost of body.posts) {
                const group = (0, make_is_1.makeId)(10);
                const randomDate = findTime();
                await this.createPost(orgId, {
                    type: 'draft',
                    date: randomDate,
                    order: '',
                    shortLink: false,
                    tags: [],
                    posts: [
                        {
                            group,
                            integration: {
                                id: integration.id,
                            },
                            settings: {
                                __type: integration.providerIdentifier,
                                title: '',
                                tags: [],
                                subreddit: [],
                            },
                            value: [
                                ...toPost.list.map((l) => ({
                                    id: '',
                                    content: l.post,
                                    delay: 0,
                                    image: [],
                                })),
                                {
                                    id: '',
                                    delay: 0,
                                    content: `Check out the full story here:\n${body.postId || body.url}`,
                                    image: [],
                                },
                            ],
                        },
                    ],
                }, 'WEB');
            }
        }
    }
    findAllExistingCategories() {
        return this._postRepository.findAllExistingCategories();
    }
    findAllExistingTopicsOfCategory(category) {
        return this._postRepository.findAllExistingTopicsOfCategory(category);
    }
    findPopularPosts(category, topic) {
        return this._postRepository.findPopularPosts(category, topic);
    }
    async findFreeDateTime(orgId, integrationId) {
        const findTimes = await this._integrationService.findFreeDateTime(orgId, integrationId);
        return this.findFreeDateTimeRecursive(orgId, findTimes.length ? findTimes : [120, 400, 700], dayjs_1.default.utc().startOf('day'), 0);
    }
    async createPopularPosts(post) {
        return this._postRepository.createPopularPosts(post);
    }
    async findFreeDateTimeRecursive(orgId, times, date, daysChecked) {
        if (daysChecked > 365) {
            return date
                .clone()
                .add(times[0] || 0, 'minutes')
                .format('YYYY-MM-DDTHH:mm:00');
        }
        const list = await this._postRepository.getPostsCountsByDates(orgId, times, date);
        if (!list.length) {
            return this.findFreeDateTimeRecursive(orgId, times, date.add(1, 'day'), daysChecked + 1);
        }
        const num = list.reduce((prev, curr) => {
            if (prev === null || prev > curr) {
                return curr;
            }
            return prev;
        }, null);
        return date.clone().add(num, 'minutes').format('YYYY-MM-DDTHH:mm:00');
    }
    async getComments(previewId) {
        const posts = await this.getPostsRecursively(previewId, false);
        const comments = await this._postRepository.getCommentsForPosts(posts.map((p) => p.id));
        return comments.map((comment) => ({
            id: comment.id,
            postId: comment.postId,
            parentId: comment.parentId,
            content: comment.content,
            anchorStart: comment.anchorStart,
            anchorEnd: comment.anchorEnd,
            anchorQuote: comment.anchorQuote,
            resolvedAt: comment.resolvedAt,
            createdAt: comment.createdAt,
            name: comment.userId
                ? [comment.user?.name, comment.user?.lastName]
                    .filter(Boolean)
                    .join(' ')
                    .trim() || null
                : comment.displayName,
        }));
    }
    async createPublicComment(previewId, body, userId, ip) {
        const posts = await this.getPostsRecursively(previewId, false);
        if (!posts.length) {
            throw new common_1.NotFoundException('Post not found');
        }
        let post = body.postId ? posts.find((p) => p.id === body.postId) : posts[0];
        if (!post) {
            throw new common_1.BadRequestException('Post does not belong to this preview');
        }
        if (!userId) {
            if (!body.displayName?.trim()) {
                throw new common_1.BadRequestException('Name is required');
            }
            await this.verifyRecaptcha(body.recaptchaToken, ip);
        }
        const hasStart = typeof body.anchorStart === 'number';
        const hasEnd = typeof body.anchorEnd === 'number';
        if (hasStart !== hasEnd) {
            throw new common_1.BadRequestException('Both anchor offsets are required');
        }
        if (body.parentId) {
            const parent = await this._postRepository.getCommentById(body.parentId);
            if (!parent || !posts.some((p) => p.id === parent.postId)) {
                throw new common_1.BadRequestException('Parent comment not found');
            }
            if (parent.parentId) {
                throw new common_1.BadRequestException('Replies can only be added to a root comment');
            }
            if (hasStart || body.anchorQuote) {
                throw new common_1.BadRequestException('Replies cannot be anchored');
            }
            post = posts.find((p) => p.id === parent.postId);
        }
        if (hasStart) {
            const plainText = (0, sanitize_post_content_1.postContentPlainText)(post.content);
            if (body.anchorStart < 0 ||
                body.anchorStart >= body.anchorEnd ||
                body.anchorEnd > plainText.length) {
                throw new common_1.BadRequestException('Anchor is out of range');
            }
            if (body.anchorQuote !== plainText.slice(body.anchorStart, body.anchorEnd)) {
                throw new common_1.BadRequestException('Anchor does not match the post text');
            }
        }
        return this._postRepository.createComment(post.organizationId, userId, post.id, body.content, {
            displayName: userId ? undefined : body.displayName.trim(),
            parentId: body.parentId,
            anchorStart: hasStart ? body.anchorStart : undefined,
            anchorEnd: hasStart ? body.anchorEnd : undefined,
            anchorQuote: hasStart ? body.anchorQuote : undefined,
        });
    }
    async verifyRecaptcha(token, ip) {
        if (!process.env.RECAPTCHA_SECRET_KEY) {
            return;
        }
        if (!token) {
            throw new common_1.BadRequestException('Captcha verification failed');
        }
        const result = await (await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: token,
                remoteip: ip,
            }),
        })).json();
        if (!result?.success) {
            throw new common_1.BadRequestException('Captcha verification failed');
        }
    }
    async resolveComment(orgId, commentId, resolved) {
        const comment = await this._postRepository.getCommentById(commentId);
        if (!comment || comment.post.organizationId !== orgId) {
            throw new common_1.NotFoundException('Comment not found');
        }
        if (comment.parentId) {
            throw new common_1.BadRequestException('Only root comments can be resolved');
        }
        return this._postRepository.setCommentResolved(commentId, resolved ? new Date() : null);
    }
    async detachStaleAnchors(posts) {
        for (const post of posts) {
            const anchored = await this._postRepository.getAnchoredCommentsForPost(post.id);
            if (!anchored.length) {
                continue;
            }
            const plainText = (0, sanitize_post_content_1.postContentPlainText)(post.content);
            const stale = anchored
                .filter((c) => c.anchorQuote !== plainText.slice(c.anchorStart, c.anchorEnd))
                .map((c) => c.id);
            if (stale.length) {
                await this._postRepository.detachAnchorsForPost(post.id, stale);
            }
        }
    }
    getTags(orgId) {
        return this._postRepository.getTags(orgId);
    }
    createTag(orgId, body) {
        return this._postRepository.createTag(orgId, body);
    }
    editTag(id, orgId, body) {
        return this._postRepository.editTag(id, orgId, body);
    }
    deleteTag(id, orgId) {
        return this._postRepository.deleteTag(id, orgId);
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [posts_repository_1.PostsRepository,
        integration_manager_1.IntegrationManager,
        integration_service_1.IntegrationService,
        media_service_1.MediaService,
        short_link_service_1.ShortLinkService,
        openai_service_1.OpenaiService,
        nestjs_temporal_core_1.TemporalService,
        refresh_integration_service_1.RefreshIntegrationService])
], PostsService);
//# sourceMappingURL=posts.service.js.map