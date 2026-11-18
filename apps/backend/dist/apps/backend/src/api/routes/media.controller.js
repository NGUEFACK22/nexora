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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const org_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/org.from.request");
const media_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/media/media.service");
const swagger_1 = require("@nestjs/swagger");
const r2_uploader_1 = __importDefault(require("../../../../../libraries/nestjs-libraries/src/upload/r2.uploader"));
const platform_express_1 = require("@nestjs/platform-express");
const multer_stream_engine_1 = require("../../../../../libraries/nestjs-libraries/src/upload/multer.stream.engine");
const subscription_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/subscriptions/subscription.service");
const upload_factory_1 = require("../../../../../libraries/nestjs-libraries/src/upload/upload.factory");
const save_media_information_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/media/save.media.information.dto");
const video_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/videos/video.dto");
const video_function_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/videos/video.function.dto");
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
__decorate([
    (0, common_1.Delete)('/:id'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "deleteMedia", null);
__decorate([
    (0, common_1.Post)('/generate-video'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, video_dto_1.VideoDto]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "generateVideo", null);
__decorate([
    (0, common_1.Post)('/generate-image'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)('prompt')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "generateImage", null);
__decorate([
    (0, common_1.Post)('/generate-image-with-prompt'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)('prompt')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "generateImageFromText", null);
__decorate([
    (0, common_1.Post)('/upload-server'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', (0, multer_stream_engine_1.streamUploadOptions)())),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadServer", null);
__decorate([
    (0, common_1.Post)('/save-media'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)('name')),
    __param(3, (0, common_1.Body)('originalName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "saveMedia", null);
__decorate([
    (0, common_1.Post)('/information'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, save_media_information_dto_1.SaveMediaInformationDto]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "saveMediaInformation", null);
__decorate([
    (0, common_1.Post)('/upload-simple'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', (0, multer_stream_engine_1.streamUploadOptions)())),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.UploadedFile)('file')),
    __param(2, (0, common_1.Body)('preventSave')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadSimple", null);
__decorate([
    (0, common_1.Post)('/:endpoint'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Param)('endpoint')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)('/:id/status'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "getMediaStatus", null);
__decorate([
    (0, common_1.Get)('/'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "getMedia", null);
__decorate([
    (0, common_1.Get)('/video-options'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "getVideos", null);
__decorate([
    (0, common_1.Post)('/video/function'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [video_function_dto_1.VideoFunctionDto]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "videoFunction", null);
__decorate([
    (0, common_1.Get)('/generate-video/:type/allowed'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "generateVideoAllowed", null);
exports.MediaController = MediaController = __decorate([
    (0, swagger_1.ApiTags)('Media'),
    (0, common_1.Controller)('/media'),
    __metadata("design:paramtypes", [media_service_1.MediaService,
        subscription_service_1.SubscriptionService])
], MediaController);
//# sourceMappingURL=media.controller.js.map