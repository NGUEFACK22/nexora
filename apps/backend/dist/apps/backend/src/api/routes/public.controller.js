"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const posts_service_1 = require("@gitroom/nestjs-libraries/database/prisma/posts/posts.service");
const track_service_1 = require("@gitroom/nestjs-libraries/track/track.service");
const nestjs_real_ip_1 = require("nestjs-real-ip");
const user_agent_1 = require("@gitroom/nestjs-libraries/user/user.agent");
const track_cookies_1 = require("@gitroom/nestjs-libraries/track/track.cookies");
const agent_graph_insert_service_1 = require("@gitroom/nestjs-libraries/agent/agent.graph.insert.service");
const subscription_service_1 = require("@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service");
const auth_service_1 = require("@gitroom/helpers/auth/auth.service");
const pricing_1 = require("@gitroom/nestjs-libraries/database/prisma/subscriptions/pricing");
const stream_1 = require("stream");
const util_1 = require("util");
const webhooks_dto_1 = require("@gitroom/nestjs-libraries/dtos/webhooks/webhooks.dto");
const webhook_url_validator_1 = require("@gitroom/nestjs-libraries/dtos/webhooks/webhook.url.validator");
const ssrf_safe_dispatcher_1 = require("@gitroom/nestjs-libraries/dtos/webhooks/ssrf.safe.dispatcher");
const add_comment_dto_1 = require("@gitroom/nestjs-libraries/dtos/comments/add.comment.dto");
const pump = (0, util_1.promisify)(stream_1.pipeline);
let PublicController = class PublicController {
    constructor(_trackService, _agentGraphInsertService, _postsService, _subscriptionService) {
        this._trackService = _trackService;
        this._agentGraphInsertService = _agentGraphInsertService;
        this._postsService = _postsService;
        this._subscriptionService = _subscriptionService;
    }
    async createAgent(body) {
        if (!body.apiKey ||
            !process.env.AGENT_API_KEY ||
            body.apiKey !== process.env.AGENT_API_KEY) {
            return;
        }
        return this._agentGraphInsertService.newPost(body.text);
    }
    async getPreview(id) {
        return (await this._postsService.getPostsRecursively(id, true)).map(({ childrenPost, batchId, ...p }) => ({
            ...p,
            ...(p.integration
                ? {
                    integration: {
                        id: p.integration.id,
                        name: p.integration.name,
                        picture: p.integration.picture,
                        providerIdentifier: p.integration.providerIdentifier,
                        profile: p.integration.profile,
                    },
                }
                : {}),
        }));
    }
    async getComments(postId) {
        return { comments: await this._postsService.getComments(postId) };
    }
    async createComment(postId, body, ip) {
        return this._postsService.createPublicComment(postId, body, null, ip);
    }
    async trackEvent(res, req, ip, userAgent, body) {
        const { uniqueId, fbc, fbp } = (0, track_cookies_1.applyTrackCookies)(req, res, body.fbclid);
        this._trackService
            .track(uniqueId, ip, userAgent, body.tt, body.additional, fbc, undefined, fbp)
            .catch((err) => { });
        res.status(200).json({
            track: uniqueId,
        });
    }
    async modifySubscription(params) {
        try {
            const load = auth_service_1.AuthService.verifyJWT(params);
            if (!load ||
                !load.orgId ||
                typeof load.orgId !== 'string' ||
                !load.billing ||
                !pricing_1.pricing[load.billing] ||
                'timeLimit' in load ||
                'providerName' in load ||
                'expires' in load) {
                return { success: false };
            }
            const totalChannels = pricing_1.pricing[load.billing].channel || 0;
            await this._subscriptionService.modifySubscriptionByOrg(load.orgId, totalChannels, load.billing);
            return { success: true };
        }
        catch (err) {
            return { success: false };
        }
    }
    async streamFile(query, res, req) {
        const { url } = query;
        if (!url.endsWith('mp4')) {
            return res.status(400).send('Invalid video URL');
        }
        const ac = new AbortController();
        const onClose = () => ac.abort();
        req.on('aborted', onClose);
        res.on('close', onClose);
        const MAX_REDIRECTS = 5;
        let currentUrl = url;
        let r;
        for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
            if (!(await (0, webhook_url_validator_1.isSafePublicHttpsUrl)(currentUrl))) {
                return res.status(400).send('Blocked URL');
            }
            r = await fetch(currentUrl, {
                signal: ac.signal,
                redirect: 'manual',
                dispatcher: ssrf_safe_dispatcher_1.ssrfSafeDispatcher,
            });
            if (r.status >= 300 && r.status < 400) {
                const location = r.headers.get('location');
                if (!location) {
                    return res.status(502).send('Redirect without Location');
                }
                try {
                    currentUrl = new URL(location, currentUrl).toString();
                }
                catch {
                    return res.status(400).send('Invalid redirect target');
                }
                continue;
            }
            break;
        }
        if (!r) {
            return res.status(502).send('No upstream response');
        }
        if (r.status >= 300 && r.status < 400) {
            return res.status(508).send('Too many redirects');
        }
        if (!r.ok && r.status !== 206) {
            res.status(r.status);
            throw new Error(`Upstream error: ${r.statusText}`);
        }
        const type = r.headers.get('content-type') ?? 'application/octet-stream';
        res.setHeader('Content-Type', type);
        const contentRange = r.headers.get('content-range');
        if (contentRange)
            res.setHeader('Content-Range', contentRange);
        const len = r.headers.get('content-length');
        if (len)
            res.setHeader('Content-Length', len);
        const acceptRanges = r.headers.get('accept-ranges') ?? 'bytes';
        res.setHeader('Accept-Ranges', acceptRanges);
        if (r.status === 206)
            res.status(206);
        try {
            await pump(stream_1.Readable.fromWeb(r.body), res);
        }
        catch (err) { }
    }
};
exports.PublicController = PublicController;
tslib_1.__decorate([
    (0, common_1.Post)('/agent'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PublicController.prototype, "createAgent", null);
tslib_1.__decorate([
    (0, common_1.Get)(`/posts/:id`),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], PublicController.prototype, "getPreview", null);
tslib_1.__decorate([
    (0, common_1.Get)(`/posts/:id/comments`),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], PublicController.prototype, "getComments", null);
tslib_1.__decorate([
    (0, common_1.Post)(`/posts/:id/comments`),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, nestjs_real_ip_1.RealIP)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, add_comment_dto_1.CreatePublicCommentDto, String]),
    tslib_1.__metadata("design:returntype", Promise)
], PublicController.prototype, "createComment", null);
tslib_1.__decorate([
    (0, common_1.Post)('/t'),
    tslib_1.__param(0, (0, common_1.Res)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__param(2, (0, nestjs_real_ip_1.RealIP)()),
    tslib_1.__param(3, (0, user_agent_1.UserAgent)()),
    tslib_1.__param(4, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, String, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PublicController.prototype, "trackEvent", null);
tslib_1.__decorate([
    (0, common_1.Post)('/modify-subscription'),
    tslib_1.__param(0, (0, common_1.Body)('params')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], PublicController.prototype, "modifySubscription", null);
tslib_1.__decorate([
    (0, common_1.Get)('/stream'),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__param(1, (0, common_1.Res)()),
    tslib_1.__param(2, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [webhooks_dto_1.OnlyURL, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PublicController.prototype, "streamFile", null);
exports.PublicController = PublicController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('Public'),
    (0, common_1.Controller)('/public'),
    tslib_1.__metadata("design:paramtypes", [track_service_1.TrackService,
        agent_graph_insert_service_1.AgentGraphInsertService,
        posts_service_1.PostsService,
        subscription_service_1.SubscriptionService])
], PublicController);
//# sourceMappingURL=public.controller.js.map