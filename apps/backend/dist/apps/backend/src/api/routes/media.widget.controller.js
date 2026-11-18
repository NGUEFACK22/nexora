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
exports.MediaWidgetController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const org_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/org.from.request");
const media_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/media/media.service");
const multer_stream_engine_1 = require("../../../../../libraries/nestjs-libraries/src/upload/multer.stream.engine");
let MediaWidgetController = class MediaWidgetController {
    constructor(_mediaService) {
        this._mediaService = _mediaService;
    }
    async upload(org, req, file, adjust = 'false') {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        return this._mediaService.saveUploadSessionFile(org.id, req.uploadSession, file.filename, file.path, file.originalname, adjust === 'true');
    }
    status(org, req) {
        return this._mediaService.getUploadSession(org.id, req.uploadSession);
    }
};
exports.MediaWidgetController = MediaWidgetController;
__decorate([
    (0, common_1.Post)('/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', (0, multer_stream_engine_1.streamUploadOptions)())),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, common_1.Body)('adjust')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", Promise)
], MediaWidgetController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)('/status'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MediaWidgetController.prototype, "status", null);
exports.MediaWidgetController = MediaWidgetController = __decorate([
    (0, swagger_1.ApiTags)('Media'),
    (0, common_1.Controller)('/media-widget'),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], MediaWidgetController);
//# sourceMappingURL=media.widget.controller.js.map