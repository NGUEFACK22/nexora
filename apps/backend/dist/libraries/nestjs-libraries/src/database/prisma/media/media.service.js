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
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const media_repository_1 = require("./media.repository");
const openai_service_1 = require("../../../openai/openai.service");
const generation_error_1 = require("../../../openai/generation.error");
const subscription_service_1 = require("../subscriptions/subscription.service");
const video_manager_1 = require("../../../videos/video.manager");
const upload_factory_1 = require("../../../upload/upload.factory");
const permission_exception_class_1 = require("../../../../../../apps/backend/src/services/auth/permissions/permission.exception.class");
const nestjs_temporal_core_1 = require("nestjs-temporal-core");
const common_2 = require("@temporalio/common");
const temporal_search_attribute_1 = require("../../../temporal/temporal.search.attribute");
const make_is_1 = require("../../../services/make.is");
const path_1 = require("path");
const crypto_1 = require("crypto");
const redis_service_1 = require("../../../redis/redis.service");
const ssrf_safe_dispatcher_1 = require("../../../dtos/webhooks/ssrf.safe.dispatcher");
const custom_upload_validation_1 = require("../../../upload/custom.upload.validation");
const VIDEO_RULES = {
    short_side_min: 1080,
    short_side_max: 1080,
    long_side_max: 1920,
    video: {
        container: 'mp4',
        video_codec: 'h264',
        profile: 'high',
        pixel_format: 'yuv420p',
        fps_max: 60,
        quality: 23,
        audio_codec: 'aac',
        audio_bitrate_kbps: 128,
        audio_sample_rate: 48000,
        faststart: true,
    },
};
const IMAGE_RULES = {
    short_side_min: 1,
    short_side_max: 1080,
    long_side_max: 1920,
    image: { jpeg_quality: 90, keep_format: true },
};
const LIMITS = {
    max_input_bytes: 1073741824,
    max_duration_seconds: 900,
    timeout_seconds: 1200,
};
const PROCESSABLE = {
    '.mp4': { type: 'video', ext: 'mp4', contentType: 'video/mp4' },
    '.mov': { type: 'video', ext: 'mp4', contentType: 'video/mp4' },
    '.jpg': { type: 'image', ext: 'jpg', contentType: 'image/jpeg' },
    '.jpeg': { type: 'image', ext: 'jpg', contentType: 'image/jpeg' },
    '.png': { type: 'image', ext: 'png', contentType: 'image/png' },
    '.webp': { type: 'image', ext: 'webp', contentType: 'image/webp' },
};
const USABLE_AS_IS = new Set([
    '.mp4',
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
]);
let MediaService = class MediaService {
    constructor(_mediaRepository, _openAi, _subscriptionService, _videoManager, _temporalService) {
        this._mediaRepository = _mediaRepository;
        this._openAi = _openAi;
        this._subscriptionService = _subscriptionService;
        this._videoManager = _videoManager;
        this._temporalService = _temporalService;
        this.storage = upload_factory_1.UploadFactory.createStorage();
        this.processor = upload_factory_1.UploadFactory.createProcessor();
    }
    async deleteMedia(org, id) {
        return this._mediaRepository.deleteMedia(org, id);
    }
    getMediaById(id) {
        return this._mediaRepository.getMediaById(id);
    }
    async generateImage(prompt, org, generatePromptFirst) {
        try {
            const generating = await this._subscriptionService.useCredit(org, 'ai_images', async () => {
                if (generatePromptFirst) {
                    prompt = await this._openAi.generatePromptForPicture(prompt);
                    console.log('Prompt:', prompt);
                }
                return this._openAi.generateImage(prompt);
            });
            return generating;
        }
        catch (err) {
            throw (0, generation_error_1.generationError)(err);
        }
    }
    async uploadFromUrl(org, url, adjust) {
        let response;
        try {
            response = await fetch(url, {
                dispatcher: ssrf_safe_dispatcher_1.ssrfSafeDispatcher,
            });
        }
        catch (err) {
            throw new common_1.BadRequestException('Failed to fetch URL', { cause: err });
        }
        if (!response.ok || !response.body) {
            throw new common_1.BadRequestException('Failed to fetch URL');
        }
        const declaredSize = Number(response.headers.get('content-length'));
        if (declaredSize && declaredSize > (0, custom_upload_validation_1.getMaxSize)('video/mp4')) {
            await response.body.cancel();
            throw new common_1.BadRequestException('File is too large.');
        }
        const uploaded = await (0, custom_upload_validation_1.uploadStreamToStorage)(this.storage, response.body, declaredSize);
        return adjust
            ? this.saveUploadedFile(org, uploaded.originalname, uploaded.path)
            : this.saveFile(org, uploaded.originalname, uploaded.path);
    }
    saveFile(org, fileName, filePath, originalName) {
        return this._mediaRepository.saveFile(org, fileName, filePath, originalName);
    }
    async saveUploadedFile(org, fileName, filePath, originalName) {
        const media = await this.saveFile(org, fileName, filePath, originalName);
        const client = this._temporalService.client.getRawClient();
        if (!this.processor ||
            !PROCESSABLE[(0, path_1.extname)(fileName).toLowerCase()] ||
            !client) {
            return media;
        }
        await this._mediaRepository.startProcessing(org, media.id);
        try {
            await client.workflow.start('processMediaWorkflow', {
                workflowId: `media_${media.id}`,
                taskQueue: 'main',
                args: [{ mediaId: media.id }],
                typedSearchAttributes: new common_2.TypedSearchAttributes([
                    {
                        key: temporal_search_attribute_1.organizationId,
                        value: org,
                    },
                ]),
            });
        }
        catch (err) {
            return this.releaseUnprocessed(org, media.id, media.name);
        }
        return { ...media, status: 'processing' };
    }
    async releaseUnprocessed(org, id, name) {
        const convertOnly = !USABLE_AS_IS.has((0, path_1.extname)(name).toLowerCase());
        await this._mediaRepository.finishProcessing(org, id, {
            ...(convertOnly
                ? { error: 'No media processor is available to convert this file' }
                : {}),
        });
        return this._mediaRepository.getMediaStatus(org, id);
    }
    async createUploadSession(org) {
        const sessionId = (0, crypto_1.randomBytes)(16).toString('hex');
        await redis_service_1.ioRedis.set(`uploadSession:${sessionId}`, org, 'EX', 3600);
        return sessionId;
    }
    async checkUploadSession(org, sessionId) {
        if ((await redis_service_1.ioRedis.get(`uploadSession:${sessionId}`)) !== org) {
            throw new common_1.HttpException('Upload session not found or expired', 404);
        }
    }
    async createUploadTicket(org, sessionId) {
        await this.checkUploadSession(org, sessionId);
        const ticket = (0, crypto_1.randomBytes)(32).toString('hex');
        await redis_service_1.ioRedis.set(`uploadTicket:${ticket}`, JSON.stringify({ org, sessionId }), 'EX', 600);
        return ticket;
    }
    async getUploadTicket(ticket) {
        const found = JSON.parse((await redis_service_1.ioRedis.get(`uploadTicket:${ticket}`)) || 'null');
        if (!found ||
            (await redis_service_1.ioRedis.get(`uploadSession:${found.sessionId}`)) !== found.org) {
            return null;
        }
        return found;
    }
    async saveUploadSessionFile(org, sessionId, fileName, filePath, originalName, adjust) {
        await this.checkUploadSession(org, sessionId);
        const media = adjust
            ? await this.saveUploadedFile(org, fileName, filePath, originalName)
            : await this.saveFile(org, fileName, filePath, originalName);
        await redis_service_1.ioRedis.rpush(`uploadSessionMedia:${sessionId}`, media.id);
        await redis_service_1.ioRedis.expire(`uploadSessionMedia:${sessionId}`, 3600);
        return media;
    }
    async getUploadSession(org, sessionId) {
        await this.checkUploadSession(org, sessionId);
        const list = await redis_service_1.ioRedis.lrange(`uploadSessionMedia:${sessionId}`, 0, -1);
        return (await Promise.all(list.map((id) => this._mediaRepository.getMediaStatus(org, id)))).filter((f) => f);
    }
    async getMediaStatus(org, id) {
        const media = await this._mediaRepository.getMediaStatus(org, id);
        if (!media) {
            throw new common_1.HttpException('Media not found', 404);
        }
        return media;
    }
    toUploadStatus(media) {
        if (media.status !== 'failed') {
            return { id: media.id, path: media.path, status: media.status };
        }
        return USABLE_AS_IS.has((0, path_1.extname)(media.name).toLowerCase())
            ? {
                id: media.id,
                path: media.path,
                status: 'ready',
                warning: 'Adjustment failed, the original file was kept and will be used for publishing',
            }
            : {
                id: media.id,
                path: media.path,
                status: 'failed',
                error: 'Processing failed and the original file cannot be used',
            };
    }
    async getMediaUploadStatus(org, id) {
        return this.toUploadStatus(await this.getMediaStatus(org, id));
    }
    normalizedName(name) {
        const ext = (0, path_1.extname)(name).toLowerCase();
        return `${name.slice(0, -ext.length)}.${PROCESSABLE[ext].ext}`;
    }
    async submitProcessing(mediaId) {
        const media = await this._mediaRepository.getMediaById(mediaId);
        if (!media) {
            return null;
        }
        const processable = PROCESSABLE[(0, path_1.extname)(media.name).toLowerCase()];
        if (!this.processor ||
            !processable ||
            !this.storage.signDownloadUrl ||
            !this.storage.signUploadUrl) {
            await this.releaseUnprocessed(media.organizationId, media.id, media.name);
            return null;
        }
        const outputName = this.normalizedName(media.name);
        return this.processor.submit({
            version: 1,
            type: processable.type,
            reference: media.id,
            source: { url: await this.storage.signDownloadUrl(media.name) },
            output: {
                url: await this.storage.signUploadUrl(outputName, processable.contentType),
                content_type: processable.contentType,
            },
            rules: processable.type === 'video' ? VIDEO_RULES : IMAGE_RULES,
            limits: LIMITS,
        });
    }
    async checkProcessing(mediaId, jobId) {
        const media = await this._mediaRepository.getMediaById(mediaId);
        if (!media) {
            return true;
        }
        if (media.status !== 'processing') {
            return true;
        }
        const org = media.organizationId;
        if (!this.processor) {
            await this.releaseUnprocessed(org, mediaId, media.name);
            return true;
        }
        const job = await this.processor.status(jobId);
        if (job.status === 'pending') {
            return false;
        }
        if (job.status === 'failed') {
            await this._mediaRepository.finishProcessing(org, mediaId, {
                error: job.error,
            });
            return true;
        }
        const { result } = job;
        if (!result ||
            !['completed', 'unchanged', 'failed'].includes(result.status)) {
            await this._mediaRepository.finishProcessing(org, mediaId, {
                error: `Unexpected processor result: ${JSON.stringify(result).slice(0, 500)}`,
            });
            return true;
        }
        if (result.status === 'failed') {
            await this._mediaRepository.finishProcessing(org, mediaId, {
                error: [
                    `${result.failure?.code || 'FAILED'}: ${result.failure?.message || ''}`,
                    result.failure?.stderr_tail,
                ]
                    .filter(Boolean)
                    .join('\n')
                    .slice(0, 4000),
            });
            return true;
        }
        if (result.status === 'unchanged') {
            await this._mediaRepository.finishProcessing(org, mediaId, {});
            return true;
        }
        const outputName = this.normalizedName(media.name);
        await this._mediaRepository.finishProcessing(org, mediaId, {
            name: outputName,
            path: media.path.slice(0, media.path.lastIndexOf('/') + 1) + outputName,
            fileSize: result.output?.bytes,
        });
        if (outputName !== media.name) {
            try {
                await this.storage.removeFile(media.name);
            }
            catch (err) {
                console.error(`Could not remove original media ${media.name}:`, err);
            }
        }
        return true;
    }
    async failProcessing(mediaId, error) {
        const media = await this._mediaRepository.getMediaById(mediaId);
        if (!media) {
            return;
        }
        return this._mediaRepository.finishProcessing(media.organizationId, mediaId, {
            error,
        });
    }
    getMedia(org, page, search) {
        return this._mediaRepository.getMedia(org, page, search);
    }
    saveMediaInformation(org, data) {
        return this._mediaRepository.saveMediaInformation(org, data);
    }
    getVideoOptions() {
        return this._videoManager.getAllVideos();
    }
    async generateVideoAllowed(org, type) {
        const video = this._videoManager.getVideoByName(type);
        if (!video) {
            throw new Error(`Video type ${type} not found`);
        }
        if (!video.trial && org.isTrailing) {
            throw new common_1.HttpException(`This video is not available in trial mode. To use it now, open ${process.env.FRONTEND_URL}/billing and click "End trial and pay now" (this charges the plan immediately). Only an admin or the super admin of the organization can end the trial and pay`, 406);
        }
        return true;
    }
    async validateVideoRequest(org, body) {
        const totalCredits = await this._subscriptionService.checkCredits(org, 'ai_videos');
        if (totalCredits.credits <= 0) {
            throw new permission_exception_class_1.SubscriptionException({
                action: permission_exception_class_1.AuthorizationActions.Create,
                section: permission_exception_class_1.Sections.VIDEOS_PER_MONTH,
            });
        }
        const video = this._videoManager.getVideoByName(body.type);
        if (!video) {
            throw new Error(`Video type ${body.type} not found`);
        }
        if (!video.trial && org.isTrailing) {
            throw new common_1.HttpException(`This video is not available in trial mode. To use it now, open ${process.env.FRONTEND_URL}/billing and click "End trial and pay now" (this charges the plan immediately). Only an admin or the super admin of the organization can end the trial and pay`, 406);
        }
        await video.instance.processAndValidate(body.customParams);
        return video;
    }
    async generateVideo(org, body) {
        try {
            const video = await this.validateVideoRequest(org, body);
            return await this._subscriptionService.useCredit(org, 'ai_videos', async () => {
                const loadedData = await video.instance.process(body.output, body.customParams);
                const file = await this.storage.uploadSimple(loadedData);
                return this.saveFile(org.id, file.split('/').pop(), file);
            });
        }
        catch (err) {
            throw (0, generation_error_1.generationError)(err);
        }
    }
    async startGenerateVideo(org, body) {
        try {
            await this.validateVideoRequest(org, body);
        }
        catch (err) {
            throw (0, generation_error_1.generationError)(err);
        }
        const client = this._temporalService.client.getRawClient();
        if (!client) {
            throw new common_1.HttpException('Video generation is not available', 503);
        }
        const jobId = `video_${org.id}_${(0, make_is_1.makeId)(10)}`;
        await client.workflow.start('generateVideoWorkflow', {
            workflowId: jobId,
            taskQueue: 'main',
            args: [
                {
                    organizationId: org.id,
                    body,
                },
            ],
            typedSearchAttributes: new common_2.TypedSearchAttributes([
                {
                    key: temporal_search_attribute_1.organizationId,
                    value: org.id,
                },
            ]),
        });
        return { jobId };
    }
    async getGenerateVideoStatus(org, jobId) {
        if (!jobId.startsWith(`video_${org.id}_`)) {
            throw new common_1.HttpException('Video job not found', 404);
        }
        const handle = await this._temporalService.client.getWorkflowHandle(jobId);
        let status;
        try {
            status = (await handle.describe()).status.name;
        }
        catch (err) {
            throw new common_1.HttpException('Video job not found', 404);
        }
        if (status === 'RUNNING') {
            return { status: 'pending' };
        }
        try {
            const media = (await handle.result());
            return { status: 'completed', id: media.id, path: media.path };
        }
        catch (err) {
            let cause = err;
            while (cause?.cause && cause.cause !== cause) {
                cause = cause.cause;
            }
            return {
                status: 'failed',
                error: cause?.message || String(err),
            };
        }
    }
    async videoFunction(identifier, functionName, body) {
        const video = this._videoManager.getVideoByName(identifier);
        if (!video) {
            throw new Error(`Video with identifier ${identifier} not found`);
        }
        const functionToCall = video.instance[functionName];
        if (typeof functionToCall !== 'function' ||
            this._videoManager.checkAvailableVideoFunction(functionToCall)) {
            throw new common_1.HttpException(`Function ${functionName} not found on video instance`, 400);
        }
        return functionToCall(body);
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [media_repository_1.MediaRepository,
        openai_service_1.OpenaiService,
        subscription_service_1.SubscriptionService,
        video_manager_1.VideoManager,
        nestjs_temporal_core_1.TemporalService])
], MediaService);
//# sourceMappingURL=media.service.js.map