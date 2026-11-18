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
exports.UploadWidgetAuthMiddleware = void 0;
const common_1 = require("@nestjs/common");
const media_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/media/media.service");
let UploadWidgetAuthMiddleware = class UploadWidgetAuthMiddleware {
    constructor(_mediaService) {
        this._mediaService = _mediaService;
    }
    async use(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        const ticket = typeof req.query.ticket === 'string' &&
            (await this._mediaService.getUploadTicket(req.query.ticket));
        if (!ticket) {
            res
                .status(common_1.HttpStatus.UNAUTHORIZED)
                .json({ msg: 'Upload ticket not found or expired' });
            return;
        }
        req.org = { id: ticket.org };
        req.uploadSession = ticket.sessionId;
        next();
    }
};
exports.UploadWidgetAuthMiddleware = UploadWidgetAuthMiddleware;
exports.UploadWidgetAuthMiddleware = UploadWidgetAuthMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], UploadWidgetAuthMiddleware);
//# sourceMappingURL=upload.widget.auth.middleware.js.map