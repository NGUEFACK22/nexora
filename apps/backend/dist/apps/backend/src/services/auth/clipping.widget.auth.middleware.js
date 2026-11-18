"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClippingWidgetAuthMiddleware = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const clipping_service_1 = require("@gitroom/nestjs-libraries/database/prisma/clipping/clipping.service");
let ClippingWidgetAuthMiddleware = class ClippingWidgetAuthMiddleware {
    constructor(_clippingService) {
        this._clippingService = _clippingService;
    }
    async use(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        const ticket = typeof req.query.ticket === 'string' &&
            (await this._clippingService.getWidgetTicket(req.query.ticket));
        if (!ticket) {
            res
                .status(common_1.HttpStatus.UNAUTHORIZED)
                .json({ msg: 'Clipping ticket not found or expired' });
            return;
        }
        req.org = { id: ticket.org };
        req.clippingId = ticket.id;
        next();
    }
};
exports.ClippingWidgetAuthMiddleware = ClippingWidgetAuthMiddleware;
exports.ClippingWidgetAuthMiddleware = ClippingWidgetAuthMiddleware = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [clipping_service_1.ClippingService])
], ClippingWidgetAuthMiddleware);
//# sourceMappingURL=clipping.widget.auth.middleware.js.map