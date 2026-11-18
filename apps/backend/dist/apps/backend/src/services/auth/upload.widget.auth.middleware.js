"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadWidgetAuthMiddleware = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const media_service_1 = require("@gitroom/nestjs-libraries/database/prisma/media/media.service");
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
exports.UploadWidgetAuthMiddleware = UploadWidgetAuthMiddleware = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [media_service_1.MediaService])
], UploadWidgetAuthMiddleware);
//# sourceMappingURL=upload.widget.auth.middleware.js.map