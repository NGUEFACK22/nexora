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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClippingService = exports.ClippingStop = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@temporalio/common");
const nestjs_temporal_core_1 = require("nestjs-temporal-core");
const clipping_repository_1 = require("./clipping.repository");
const upload_factory_1 = require("../../../upload/upload.factory");
const subscription_service_1 = require("../subscriptions/subscription.service");
const organization_service_1 = require("../organizations/organization.service");
const integration_service_1 = require("../integrations/integration.service");
const posts_service_1 = require("../posts/posts.service");
const media_service_1 = require("../media/media.service");
const openai_service_1 = require("../../../openai/openai.service");
const deepgram_service_1 = require("../../../deepgram/deepgram.service");
const temporal_search_attribute_1 = require("../../../temporal/temporal.search.attribute");
const social_abstract_1 = require("../../../integrations/social.abstract");
const make_is_1 = require("../../../services/make.is");
const crypto_1 = require("crypto");
const redis_service_1 = require("../../../redis/redis.service");
const timer_1 = require("../../../../../helpers/src/utils/timer");
const dayjs_1 = __importDefault(require("dayjs"));
const permission_exception_class_1 = require("../../../../../../apps/backend/src/services/auth/permissions/permission.exception.class");
class ClippingStop extends common_2.ApplicationFailure {
    constructor(message) {
        super((0, social_abstract_1.truncateForTemporal)(message, 2000), 'clipping_stop', true);
    }
}
exports.ClippingStop = ClippingStop;
const CREDITS_TYPE = 'clipping_minutes';
const WINDOW_PADDING = 2;
const MIN_CLIP_SECONDS = 10;
const MAX_CLIP_SECONDS = 90;
const MAX_SOURCE_MINUTES = 180;
const MAX_RUNNING = 1;
const MAX_STARTS_PER_DAY = 20;
const STALE_HOURS = 4;
const SOMETHING_WENT_WRONG = 'Something went wrong while clipping this video, the clipping minutes were given back.';
let ClippingService = class ClippingService {
    constructor(_clippingRepository, _subscriptionService, _organizationService, _integrationService, _postsService, _mediaService, _openAi, _deepgram, _temporalService) {
        this._clippingRepository = _clippingRepository;
        this._subscriptionService = _subscriptionService;
        this._organizationService = _organizationService;
        this._integrationService = _integrationService;
        this._postsService = _postsService;
        this._mediaService = _mediaService;
        this._openAi = _openAi;
        this._deepgram = _deepgram;
        this._temporalService = _temporalService;
        this.storage = upload_factory_1.UploadFactory.createStorage();
        this.ingest = upload_factory_1.UploadFactory.createIngestProcessor();
        this.clipper = upload_factory_1.UploadFactory.createClipProcessor();
    }
    keys(clippingId) {
        return {
            transcript: `clipping-${clippingId}-transcript.json`,
            audio: `clipping-${clippingId}-audio.ogg`,
        };
    }
    clipKeys(clipId) {
        return {
            source: `clip-${clipId}-source.mp4`,
            words: `clip-${clipId}-words.json`,
            output: `clip-${clipId}.mp4`,
            thumbnail: `clip-${clipId}.jpg`,
        };
    }
    putJson(key, value) {
        return this.storage.writeFile(key, JSON.stringify(value), 'application/json');
    }
    async getJson(key) {
        return JSON.parse(await this.storage.readFile(key));
    }
    async removeFiles(keys) {
        for (const key of keys) {
            try {
                await this.storage.removeFile(key);
            }
            catch (err) {
                console.error(`Could not remove clipping file ${key}:`, err);
            }
        }
    }
    failureMessage(failure) {
        switch (failure?.code) {
            case 'SOURCE_UNAVAILABLE':
                return 'This video is private, removed, or restricted by age or region, so it cannot be clipped.';
            case 'UNSUPPORTED_INPUT':
                return 'This link is not a video that can be clipped. Live streams are not supported.';
            default:
                console.error('Clipping job failed:', JSON.stringify(failure)?.replace(/https?:\/\/[^\s"'\\]+/g, '[url]'));
                return `The video could not be processed (${failure?.code || 'FAILED'}).`;
        }
    }
    isYoutubeUrl(url) {
        try {
            const { protocol, hostname } = new URL(url);
            return (['http:', 'https:'].includes(protocol) &&
                /(^|\.)(youtube\.com|youtu\.be)$/i.test(hostname));
        }
        catch (err) {
            return false;
        }
    }
    async balance(organizationId) {
        if (!process.env.STRIPE_PUBLISHABLE_KEY) {
            return MAX_SOURCE_MINUTES;
        }
        const org = await this._organizationService.getOrgByIdWithSubscription(organizationId);
        return (await this._subscriptionService.checkCredits(org, CREDITS_TYPE))
            .credits;
    }
    isStale(clipping) {
        return (!['completed', 'failed'].includes(clipping.status) &&
            (0, dayjs_1.default)(clipping.createdAt).isBefore((0, dayjs_1.default)().subtract(STALE_HOURS, 'hour')));
    }
    async startClipping(org, body) {
        if (!this.ingest ||
            !this.clipper ||
            !this.storage.signDownloadUrl ||
            !this.storage.signUploadUrl) {
            throw new common_1.HttpException('Clipping is not available', 503);
        }
        if (!this.isYoutubeUrl(body.url)) {
            throw new common_1.HttpException('Only YouTube videos can be clipped', 400);
        }
        if (org.isTrailing) {
            throw new common_1.HttpException(`Clipping is not available in trial mode. To use it now, open ${process.env.FRONTEND_URL}/billing and click "End trial and pay now" (this charges the plan immediately). Only an admin or the super admin of the organization can end the trial and pay`, 406);
        }
        if ((await this.balance(org.id)) <= 0) {
            throw new permission_exception_class_1.SubscriptionException({
                action: permission_exception_class_1.AuthorizationActions.Create,
                section: permission_exception_class_1.Sections.CLIPPING_MINUTES,
            });
        }
        const integrations = body.integrations || [];
        for (const integration of integrations) {
            if (!(await this._integrationService.getIntegrationById(org.id, integration))) {
                throw new common_1.HttpException(`Channel ${integration} not found`, 400);
            }
        }
        const client = this._temporalService.client.getRawClient();
        if (!client) {
            throw new common_1.HttpException('Clipping is not available', 503);
        }
        if (!(await redis_service_1.ioRedis.set(`clippingStart:${org.id}`, '1', 'EX', 15, 'NX'))) {
            throw new common_1.HttpException('Another clipping is being started', 429);
        }
        try {
            return await this.createClipping(org.id, body, integrations, client);
        }
        finally {
            await redis_service_1.ioRedis.del(`clippingStart:${org.id}`);
        }
    }
    async createClipping(org, body, integrations, client) {
        const running = await this._clippingRepository.getRunningClippings(org);
        for (const clipping of running.filter((p) => this.isStale(p))) {
            await this.failClipping(clipping.id, 'The clipping never finished', true);
        }
        if (running.filter((p) => !this.isStale(p)).length >= MAX_RUNNING) {
            throw new common_1.HttpException('A clipping is already running, wait for it to finish', 429);
        }
        if ((await this._clippingRepository.countClippingsSince(org, (0, dayjs_1.default)().subtract(1, 'day').toDate())) >= MAX_STARTS_PER_DAY) {
            throw new common_1.HttpException('Too many clippings were started today, try again tomorrow', 429);
        }
        const clipping = await this._clippingRepository.createClipping(org, body.url, body.clips || 5, body.fit || 'blur', integrations);
        try {
            await client.workflow.start('clippingWorkflow', {
                workflowId: `clipping_${clipping.id}`,
                taskQueue: 'main',
                args: [{ clippingId: clipping.id }],
                typedSearchAttributes: new common_2.TypedSearchAttributes([
                    {
                        key: temporal_search_attribute_1.organizationId,
                        value: org,
                    },
                ]),
            });
        }
        catch (err) {
            await this._clippingRepository.updateClipping(org, clipping.id, {
                status: 'failed',
                error: 'Could not start clipping',
            });
            throw new common_1.HttpException('Clipping is not available', 503);
        }
        return { id: clipping.id };
    }
    async getClipping(org, id) {
        const clipping = await this._clippingRepository.getClipping(org, id);
        if (!clipping) {
            throw new common_1.HttpException('Clipping not found', 404);
        }
        if (this.isStale(clipping)) {
            await this.failClipping(id, 'The clipping never finished', true);
            return (await this._clippingRepository.getClipping(org, id));
        }
        return clipping;
    }
    async waitForClipping(org, id, seconds) {
        const progress = (clipping) => clipping.status +
            clipping.clips.filter((clip) => clip.status !== 'pending').length;
        const first = await this.getClipping(org, id);
        let current = first;
        for (let waited = 0; waited < seconds &&
            !['completed', 'failed'].includes(current.status) &&
            progress(current) === progress(first); waited += 3) {
            await (0, timer_1.timer)(3000);
            current = await this.getClipping(org, id);
        }
        return current;
    }
    async createWidgetTicket(org, id) {
        await this.getClipping(org, id);
        const ticket = (0, crypto_1.randomBytes)(32).toString('hex');
        await redis_service_1.ioRedis.set(`clippingTicket:${ticket}`, JSON.stringify({ org, id }), 'EX', 600);
        return ticket;
    }
    async getWidgetProgress(org, id, sawRunning) {
        const clipping = await this._clippingRepository.getClippingProgress(org, id);
        if (!clipping) {
            throw new common_1.HttpException('Clipping not found', 404);
        }
        const report = sawRunning &&
            ['completed', 'failed'].includes(clipping.status) &&
            !!(await redis_service_1.ioRedis.set(`clippingReported:${id}`, '1', 'EX', 24 * 3600, 'NX'));
        return { ...clipping, report };
    }
    async getWidgetTicket(ticket) {
        return JSON.parse((await redis_service_1.ioRedis.get(`clippingTicket:${ticket}`)) || 'null');
    }
    getClippings(org, page) {
        return this._clippingRepository.getClippings(org, page);
    }
    async submitAnalyse(clippingId) {
        const clipping = await this._clippingRepository.getClippingById(clippingId);
        if (!clipping) {
            throw new ClippingStop('Clipping not found');
        }
        const minutes = Math.min(await this.balance(clipping.organizationId), MAX_SOURCE_MINUTES);
        if (minutes <= 0) {
            throw new ClippingStop('No clipping minutes are left on this account for this month.');
        }
        const audioOnly = clipping.status === 'transcribing';
        const keys = this.keys(clippingId);
        return this.ingest.submit({
            version: 1,
            type: 'ingest',
            reference: clippingId,
            source: { url: clipping.url, via: 'oxylabs' },
            ...(audioOnly
                ? {}
                : {
                    transcript: {
                        url: await this.storage.signUploadUrl(keys.transcript, 'application/json'),
                        languages: ['en'],
                    },
                }),
            audio: {
                url: await this.storage.signUploadUrl(keys.audio, 'audio/ogg'),
                unless_transcript: !audioOnly,
            },
            limits: { max_duration_seconds: minutes * 60 },
        });
    }
    async checkAnalyse(clippingId, jobId) {
        const clipping = await this._clippingRepository.getClippingById(clippingId);
        if (!clipping) {
            throw new ClippingStop('Clipping not found');
        }
        const job = await this.ingest.status(jobId);
        if (job.status === 'pending') {
            return { state: 'pending' };
        }
        if (job.status === 'failed') {
            return { state: 'retry' };
        }
        const { result } = job;
        if (result?.status === 'failed') {
            if (result.failure?.retryable) {
                return { state: 'retry' };
            }
            if (result.failure?.code === 'DURATION_TOO_LONG') {
                throw new ClippingStop(`This video is ${Math.ceil((result.source?.duration_seconds || 0) / 60)} minutes long. It has to fit the clipping minutes left on this account for this month, and ${MAX_SOURCE_MINUTES} minutes at most.`);
            }
            throw new ClippingStop(this.failureMessage(result.failure));
        }
        const duration = result?.source?.duration_seconds;
        if (result?.status !== 'completed' || !duration) {
            console.error('Unexpected analyse result:', JSON.stringify(result));
            throw new ClippingStop(SOMETHING_WENT_WRONG);
        }
        if (!result.transcript && !result.audio) {
            throw new ClippingStop('This video has no captions and no audio.');
        }
        if (result.transcript && result.transcript.origin !== 'auto_generated') {
            await this._clippingRepository.updateClipping(clipping.organizationId, clippingId, { status: 'transcribing' });
            return { state: 'retry' };
        }
        const minutes = Math.ceil(duration / 60);
        const credits = (await this._subscriptionService.chargeCredits(clippingId, clipping.organizationId, CREDITS_TYPE, minutes)).id;
        if ((await this.balance(clipping.organizationId)) < 0) {
            throw new ClippingStop(`This video is ${minutes} minutes long, more than the clipping minutes left on this account for this month.`);
        }
        await this._clippingRepository.updateClipping(clipping.organizationId, clippingId, {
            title: result.source?.title || clipping.url,
            ...(result.source?.thumbnail_url
                ? { thumbnail: result.source.thumbnail_url }
                : {}),
            duration: Math.ceil(duration),
            creditsId: credits,
        });
        return { state: 'done', transcribe: !result.transcript };
    }
    async transcribe(clippingId) {
        const clipping = await this._clippingRepository.getClippingById(clippingId);
        if (!clipping) {
            throw new ClippingStop('Clipping not found');
        }
        await this._clippingRepository.updateClipping(clipping.organizationId, clippingId, { status: 'transcribing' });
        const keys = this.keys(clippingId);
        const transcript = await this._deepgram.transcribeUrl(await this.storage.signDownloadUrl(keys.audio));
        await this.putJson(keys.transcript, transcript);
    }
    async pickClips(clippingId) {
        const clipping = await this._clippingRepository.getClippingById(clippingId);
        if (!clipping) {
            throw new ClippingStop('Clipping not found');
        }
        if (clipping.clips.length) {
            return clipping.clips.map((clip) => clip.id);
        }
        await this._clippingRepository.updateClipping(clipping.organizationId, clippingId, { status: 'picking' });
        const { segments, language } = await this.getJson(this.keys(clippingId).transcript);
        if (!segments?.length) {
            throw new ClippingStop('No speech was found in this video.');
        }
        const picked = await this._openAi.pickClips(clipping.title || '', language, segments, clipping.maxClips);
        const clips = picked
            .filter((clip) => Number.isInteger(clip.from) &&
            Number.isInteger(clip.to) &&
            clip.from >= 0 &&
            clip.to < segments.length &&
            clip.from <= clip.to)
            .map((clip) => {
            let to = clip.to;
            while (to > clip.from &&
                segments[to].end - segments[clip.from].start > MAX_CLIP_SECONDS) {
                to--;
            }
            return {
                title: clip.title,
                content: clip.content,
                start: segments[clip.from].start,
                end: segments[to].end,
            };
        })
            .filter((clip) => clip.end - clip.start >= MIN_CLIP_SECONDS &&
            clip.end - clip.start <= MAX_CLIP_SECONDS)
            .reduce((all, clip) => all.some((p) => clip.start < p.end && p.start < clip.end)
            ? all
            : [...all, clip], [])
            .slice(0, clipping.maxClips);
        if (!clips.length) {
            throw new ClippingStop('No part of this video works as a short clip.');
        }
        const created = await this._clippingRepository.createClips(clippingId, clips);
        await this._clippingRepository.updateClipping(clipping.organizationId, clippingId, { status: 'rendering' });
        return created.map((clip) => clip.id);
    }
    async submitClipFetch(clipId) {
        const clip = await this._clippingRepository.getClipById(clipId);
        if (!clip) {
            throw new ClippingStop('Clip not found');
        }
        const end = Math.ceil(clip.end) + WINDOW_PADDING;
        return this.ingest.submit({
            version: 1,
            type: 'ingest',
            reference: clipId,
            source: {
                url: clip.clipping.url,
                via: 'oxylabs',
                max_height: clip.clipping.fit === 'crop' ? 1080 : 720,
                start_seconds: Math.max(0, Math.floor(clip.start) - WINDOW_PADDING),
                end_seconds: clip.clipping.duration
                    ? Math.min(clip.clipping.duration, end)
                    : end,
            },
            video: {
                url: await this.storage.signUploadUrl(this.clipKeys(clipId).source, 'video/mp4'),
            },
        });
    }
    async checkClipFetch(clipId, jobId) {
        const clip = await this._clippingRepository.getClipById(clipId);
        if (!clip) {
            return { state: 'failed' };
        }
        const job = await this.ingest.status(jobId);
        if (job.status === 'pending') {
            return { state: 'pending' };
        }
        if (job.status === 'failed') {
            return { state: 'retry' };
        }
        const { result } = job;
        if (result?.status === 'failed' && result.failure?.retryable) {
            return { state: 'retry' };
        }
        if (result?.status !== 'completed' || !result.video) {
            if (!result?.failure) {
                console.error('Unexpected fetch result:', JSON.stringify(result));
            }
            await this.failClip(clipId, result?.failure
                ? this.failureMessage(result.failure)
                : 'The clip could not be downloaded', true);
            return { state: 'failed' };
        }
        await this._clippingRepository.updateClip(clipId, {
            trimStart: result.source?.trim?.start_seconds ??
                Math.max(0, Math.floor(clip.start) - WINDOW_PADDING),
        });
        return { state: 'done' };
    }
    async captionClip(clipId) {
        const clip = await this._clippingRepository.getClipById(clipId);
        if (!clip) {
            throw new ClippingStop('Clip not found');
        }
        const keys = this.clipKeys(clipId);
        const trimStart = clip.trimStart || 0;
        const transcript = await this.getJson(this.keys(clip.clippingId).transcript);
        const words = transcript.word_level
            ? transcript.words
                .filter((word) => word.end > clip.start && word.start < clip.end)
                .map((word) => ({
                text: word.text,
                start: Math.max(0, word.start - trimStart),
                end: Math.max(0, word.end - trimStart),
            }))
            : (await this._deepgram.transcribeUrl(await this.storage.signDownloadUrl(keys.source))).words;
        await this.putJson(keys.words, words);
    }
    async submitClipRender(clipId) {
        const clip = await this._clippingRepository.getClipById(clipId);
        if (!clip) {
            throw new ClippingStop('Clip not found');
        }
        const keys = this.clipKeys(clipId);
        const trimStart = clip.trimStart || 0;
        const words = await this.getJson(keys.words);
        return this.clipper.submit({
            version: 1,
            type: 'clip',
            reference: clipId,
            source: { url: await this.storage.signDownloadUrl(keys.source) },
            clips: [
                {
                    reference: clipId,
                    start_seconds: Math.max(0, clip.start - trimStart),
                    end_seconds: clip.end - trimStart,
                    output: {
                        url: await this.storage.signUploadUrl(keys.output, 'video/mp4'),
                    },
                    thumbnail: {
                        url: await this.storage.signUploadUrl(keys.thumbnail, 'image/jpeg'),
                        timestamp_seconds: 0,
                    },
                },
            ],
            frame: {
                width: 1080,
                height: 1920,
                fit: clip.clipping.fit === 'crop' ? 'crop' : 'blur',
            },
            ...(words.length ? { captions: { words } } : {}),
        });
    }
    async checkClipRender(clipId, jobId) {
        const clip = await this._clippingRepository.getClipById(clipId);
        if (!clip) {
            return { state: 'failed' };
        }
        if (clip.status === 'completed') {
            return { state: 'done' };
        }
        const job = await this.clipper.status(jobId);
        if (job.status === 'pending') {
            return { state: 'pending' };
        }
        if (job.status === 'failed') {
            return { state: 'retry' };
        }
        const rendered = job.result?.clips?.[0];
        const failure = rendered?.failure || job.result?.failure;
        if (rendered?.status !== 'completed' && failure?.retryable) {
            return { state: 'retry' };
        }
        if (rendered?.status !== 'completed') {
            if (!failure) {
                console.error('Unexpected render result:', JSON.stringify(job.result));
            }
            await this.failClip(clipId, failure
                ? this.failureMessage(failure)
                : 'The clip could not be rendered', true);
            return { state: 'failed' };
        }
        const keys = this.clipKeys(clipId);
        const org = clip.clipping.organizationId;
        const path = this.storage.publicUrl(keys.output);
        const thumbnail = rendered.thumbnail
            ? this.storage.publicUrl(keys.thumbnail)
            : undefined;
        const mediaId = clip.mediaId ||
            (await this._mediaService.saveFile(org, keys.output, path, `${clip.title}.mp4`)).id;
        if (!clip.mediaId) {
            await this._clippingRepository.updateClip(clipId, { mediaId });
        }
        if (thumbnail) {
            await this._mediaService.saveMediaInformation(org, {
                id: mediaId,
                alt: clip.title,
                thumbnail,
                thumbnailTimestamp: 0,
            });
        }
        await this._clippingRepository.updateClip(clipId, {
            status: 'completed',
            error: null,
            path,
            ...(thumbnail ? { thumbnail } : {}),
        });
        await this.removeFiles([keys.source, keys.words]);
        return { state: 'done' };
    }
    async failClip(clipId, error, customer = false) {
        const clip = await this._clippingRepository.getClipById(clipId);
        if (!clip || clip.status !== 'pending') {
            return;
        }
        if (!customer) {
            console.error(`Clip ${clipId} failed:`, error);
        }
        await this.removeFiles(Object.values(this.clipKeys(clipId)));
        return this._clippingRepository.updateClip(clipId, {
            status: 'failed',
            error: customer ? error.slice(0, 4000) : 'The clip could not be rendered',
        });
    }
    async removeUnfinishedClipFiles(clips) {
        for (const clip of clips.filter((p) => p.status !== 'completed')) {
            await this.removeFiles(Object.values(this.clipKeys(clip.id)));
        }
    }
    async createDrafts(clippingId) {
        const clipping = await this._clippingRepository.getClippingById(clippingId);
        if (!clipping) {
            return;
        }
        const integrations = (await Promise.all(JSON.parse(clipping.integrations).map((id) => this._integrationService.getIntegrationById(clipping.organizationId, id)))).filter((f) => f && !f.deletedAt && !f.disabled);
        if (!integrations.length) {
            return;
        }
        for (const clip of clipping.clips) {
            if (clip.status !== 'completed' || clip.draftedAt || !clip.path) {
                continue;
            }
            const nextTime = await this._postsService.findFreeDateTime(clipping.organizationId);
            if (!(await this._clippingRepository.claimClipDraft(clip.id))) {
                continue;
            }
            for (const integration of integrations) {
                try {
                    await this._postsService.createPost(clipping.organizationId, {
                        date: nextTime + 'Z',
                        order: (0, make_is_1.makeId)(10),
                        shortLink: false,
                        type: 'draft',
                        tags: [],
                        posts: [
                            {
                                settings: {
                                    __type: integration.providerIdentifier,
                                },
                                group: (0, make_is_1.makeId)(10),
                                integration: { id: integration.id },
                                value: [
                                    {
                                        id: (0, make_is_1.makeId)(10),
                                        delay: 0,
                                        content: clip.content,
                                        image: [
                                            {
                                                id: clip.mediaId || (0, make_is_1.makeId)(10),
                                                path: clip.path,
                                                ...(clip.thumbnail
                                                    ? { thumbnail: clip.thumbnail }
                                                    : {}),
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    }, 'UNKNOWN');
                }
                catch (err) {
                    console.error(`Could not draft clip ${clip.id} on channel ${integration.id}:`, err);
                }
            }
        }
    }
    async finishClipping(clippingId) {
        const clipping = await this._clippingRepository.getClippingById(clippingId);
        if (!clipping) {
            return;
        }
        if (!clipping.clips.some((clip) => clip.status === 'completed')) {
            return this.failClipping(clippingId, 'No clip could be rendered', true);
        }
        await this._clippingRepository.failUnfinishedClips(clippingId, 'The clip could not be rendered');
        const keys = this.keys(clippingId);
        await this.removeFiles([keys.transcript, keys.audio]);
        await this.removeUnfinishedClipFiles(clipping.clips);
        return this._clippingRepository.updateClipping(clipping.organizationId, clippingId, { status: 'completed', error: null });
    }
    async failClipping(clippingId, error, customer = false) {
        const clipping = await this._clippingRepository.getClippingById(clippingId);
        if (!clipping) {
            return;
        }
        if (!customer) {
            console.error(`Clipping ${clippingId} failed:`, error);
        }
        const keys = this.keys(clippingId);
        await this.removeFiles([keys.transcript, keys.audio]);
        await this.removeUnfinishedClipFiles(clipping.clips);
        await this._clippingRepository.failUnfinishedClips(clippingId, 'The clip could not be rendered');
        const rendered = clipping.clips.some((clip) => clip.status === 'completed');
        if (!rendered) {
            await this._subscriptionService.refundCredits(clipping.organizationId, clippingId);
        }
        return this._clippingRepository.updateClipping(clipping.organizationId, clippingId, {
            status: rendered ? 'completed' : 'failed',
            error: customer
                ? error.slice(0, 4000)
                : rendered
                    ? 'Something went wrong after the clips were made.'
                    : SOMETHING_WENT_WRONG,
            ...(rendered ? {} : { creditsId: null }),
        });
    }
};
exports.ClippingService = ClippingService;
exports.ClippingService = ClippingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [clipping_repository_1.ClippingRepository,
        subscription_service_1.SubscriptionService,
        organization_service_1.OrganizationService,
        integration_service_1.IntegrationService,
        posts_service_1.PostsService,
        media_service_1.MediaService,
        openai_service_1.OpenaiService,
        deepgram_service_1.DeepgramService,
        nestjs_temporal_core_1.TemporalService])
], ClippingService);
//# sourceMappingURL=clipping.service.js.map