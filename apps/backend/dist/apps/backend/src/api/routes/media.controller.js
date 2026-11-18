"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const org_from_request_1 = require("@gitroom/nestjs-libraries/user/org.from.request");
const media_service_1 = require("@gitroom/nestjs-libraries/database/prisma/media/media.service");
const swagger_1 = require("@nestjs/swagger");
const r2_uploader_1 = tslib_1.__importDefault(require("@gitroom/nestjs-libraries/upload/r2.uploader"));
const platform_express_1 = require("@nestjs/platform-express");
const multer_stream_engine_1 = require("@gitroom/nestjs-libraries/upload/multer.stream.engine");
const subscription_service_1 = require("@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service");
const upload_factory_1 = require("@gitroom/nestjs-libraries/upload/upload.factory");
const save_media_information_dto_1 = require("@gitroom/nestjs-libraries/dtos/media/save.media.information.dto");
const video_dto_1 = require("@gitroom/nestjs-libraries/dtos/videos/video.dto");
const video_function_dto_1 = require("@gitroom/nestjs-libraries/dtos/videos/video.function.dto");
let MediaController = class MediaController {
    constructor(_mediaService, _subscriptionService) {
        this._mediaService = _mediaService;
        this._subscriptionService = _subscriptionService;
        this.storage = upload_factory_1.UploadFactory.createStorage();
    }
    deleteMedia(org, id) {
        return this._mediaService.deleteMedia(org.id, id);
    }
    generateVideo(org, body) {
        console.log('hello');
        return this._mediaService.generateVideo(org, body);
    }
    async generateImage(org, req, prompt, isPicturePrompt = false) {
        const total = await this._subscriptionService.checkCredits(org);
        if (process.env.STRIPE_PUBLISHABLE_KEY && total.credits <= 0) {
            return false;
        }
        return {
            output: 'data:image/png;base64,' +
                (await this._mediaService.generateImage(prompt, org, isPicturePrompt)),
        };
    }
    async generateImageFromText(org, req, prompt) {
        const image = await this.generateImage(org, req, prompt, true);
        if (!image) {
            return false;
        }
        const file = await this.storage.uploadSimple(image.output);
        return this._mediaService.saveFile(org.id, file.split('/').pop(), file);
    }
    async uploadServer(org, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        return this._mediaService.saveFile(org.id, file.filename, file.path, file.originalname);
    }
    async saveMedia(org, req, name, originalName) {
        if (!name) {
            return false;
        }
        if (!process.env.CLOUDFLARE_BUCKET_URL ||
            typeof name !== 'string' ||
            /[\\/]/.test(name) ||
            name === '.' ||
            name === '..') {
            throw new common_1.BadRequestException('Invalid file name');
        }
        return this._mediaService.saveFile(org.id, name, process.env.CLOUDFLARE_BUCKET_URL + '/' + name, originalName || undefined);
    }
    saveMediaInformation(org, body) {
        return this._mediaService.saveMediaInformation(org.id, body);
    }
    async uploadSimple(org, file, preventSave = 'false') {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        if (preventSave === 'true') {
            return { path: file.path };
        }
        return this._mediaService.saveFile(org.id, file.filename, file.path, file.originalname);
    }
    async uploadFile(org, req, res, endpoint) {
        const upload = await (0, r2_uploader_1.default)(endpoint, req, res);
        if (endpoint !== 'complete-multipart-upload' || res.headersSent) {
            return upload;
        }
        const name = upload.Location.split('/').pop();
        const originalName = req.body?.file?.name;
        const saveFile = await this._mediaService.saveUploadedFile(org.id, name, upload.Location, originalName || undefined);
        res.status(200).json({ ...upload, saved: saveFile });
    }
    getMediaStatus(org, id) {
        return this._mediaService.getMediaStatus(org.id, id);
    }
    getMedia(org, page, search) {
        return this._mediaService.getMedia(org.id, page, search);
    }
    getVideos() {
        return this._mediaService.getVideoOptions();
    }
    videoFunction(body) {
        return this._mediaService.videoFunction(body.identifier, body.functionName, body.params);
    }
    generateVideoAllowed(org, type) {
        return this._mediaService.generateVideoAllowed(org, type);
    }
};
exports.MediaController = MediaController;
tslib_1.__decorate([
    (0, common_1.Delete)('/:id'),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", void 0)
], MediaController.prototype, "deleteMedia", null);
tslib_1.__decorate([
    (0, common_1.Post)('/generate-video'),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, video_dto_1.VideoDto]),
    tslib_1.__metadata("design:returntype", void 0)
], MediaController.prototype, "generateVideo", null);
tslib_1.__decorate([
    (0, common_1.Post)('/generate-image'),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__param(2, (0, common_1.Body)('prompt')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], MediaController.prototype, "generateImage", null);
tslib_1.__decorate([
    (0, common_1.Post)('/generate-image-with-prompt'),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__param(2, (0, common_1.Body)('prompt')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], MediaController.prototype, "generateImageFromText", null);
tslib_1.__decorate([
    (0, common_1.Post)('/upload-server'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', (0, multer_stream_engine_1.streamUploadOptions)())),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.UploadedFile)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], MediaController.prototype, "uploadServer", null);
tslib_1.__decorate([
    (0, common_1.Post)('/save-media'),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__param(2, (0, common_1.Body)('name')),
    tslib_1.__param(3, (0, common_1.Body)('originalName')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], MediaController.prototype, "saveMedia", null);
tslib_1.__decorate([
    (0, common_1.Post)('/information'),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, save_media_information_dto_1.SaveMediaInformationDto]),
    tslib_1.__metadata("design:returntype", void 0)
], MediaController.prototype, "saveMediaInformation", null);
tslib_1.__decorate([
    (0, common_1.Post)('/upload-simple'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', (0, multer_stream_engine_1.streamUploadOptions)())),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.UploadedFile)('file')),
    tslib_1.__param(2, (0, common_1.Body)('preventSave')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], MediaController.prototype, "uploadSimple", null);
tslib_1.__decorate([
    (0, common_1.Post)('/:endpoint'),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__param(2, (0, common_1.Res)()),
    tslib_1.__param(3, (0, common_1.Param)('endpoint')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], MediaController.prototype, "uploadFile", null);
tslib_1.__decorate([
    (0, common_1.Get)('/:id/status'),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", void 0)
], MediaController.prototype, "getMediaStatus", null);
tslib_1.__decorate([
    (0, common_1.Get)('/'),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Query)('page')),
    tslib_1.__param(2, (0, common_1.Query)('search')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Number, String]),
    tslib_1.__metadata("design:returntype", void 0)
], MediaController.prototype, "getMedia", null);
tslib_1.__decorate([
    (0, common_1.Get)('/video-options'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], MediaController.prototype, "getVideos", null);
tslib_1.__decorate([
    (0, common_1.Post)('/video/function'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [video_function_dto_1.VideoFunctionDto]),
    tslib_1.__metadata("design:returntype", void 0)
], MediaController.prototype, "videoFunction", null);
tslib_1.__decorate([
    (0, common_1.Get)('/generate-video/:type/allowed'),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Param)('type')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", void 0)
], MediaController.prototype, "generateVideoAllowed", null);
exports.MediaController = MediaController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('Media'),
    (0, common_1.Controller)('/media'),
    tslib_1.__metadata("design:paramtypes", [media_service_1.MediaService,
        subscription_service_1.SubscriptionService])
], MediaController);
//# sourceMappingURL=media.controller.js.map