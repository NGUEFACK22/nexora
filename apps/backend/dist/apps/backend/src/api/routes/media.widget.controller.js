"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaWidgetController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const org_from_request_1 = require("@gitroom/nestjs-libraries/user/org.from.request");
const media_service_1 = require("@gitroom/nestjs-libraries/database/prisma/media/media.service");
const multer_stream_engine_1 = require("@gitroom/nestjs-libraries/upload/multer.stream.engine");
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
tslib_1.__decorate([
    (0, common_1.Post)('/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', (0, multer_stream_engine_1.streamUploadOptions)())),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__param(2, (0, common_1.UploadedFile)()),
    tslib_1.__param(3, (0, common_1.Body)('adjust')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], MediaWidgetController.prototype, "upload", null);
tslib_1.__decorate([
    (0, common_1.Get)('/status'),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], MediaWidgetController.prototype, "status", null);
exports.MediaWidgetController = MediaWidgetController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('Media'),
    (0, common_1.Controller)('/media-widget'),
    tslib_1.__metadata("design:paramtypes", [media_service_1.MediaService])
], MediaWidgetController);
//# sourceMappingURL=media.widget.controller.js.map