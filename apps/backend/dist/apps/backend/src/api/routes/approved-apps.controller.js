"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovedAppsController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const user_from_request_1 = require("@gitroom/nestjs-libraries/user/user.from.request");
const swagger_1 = require("@nestjs/swagger");
const oauth_service_1 = require("@gitroom/nestjs-libraries/database/prisma/oauth/oauth.service");
let ApprovedAppsController = class ApprovedAppsController {
    constructor(_oauthService) {
        this._oauthService = _oauthService;
    }
    async list(user) {
        return this._oauthService.getApprovedApps(user.id);
    }
    async revoke(user, id) {
        return this._oauthService.revokeApp(user.id, id);
    }
};
exports.ApprovedAppsController = ApprovedAppsController;
tslib_1.__decorate([
    (0, common_1.Get)('/'),
    tslib_1.__param(0, (0, user_from_request_1.GetUserFromRequest)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ApprovedAppsController.prototype, "list", null);
tslib_1.__decorate([
    (0, common_1.Delete)('/:id'),
    tslib_1.__param(0, (0, user_from_request_1.GetUserFromRequest)()),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], ApprovedAppsController.prototype, "revoke", null);
exports.ApprovedAppsController = ApprovedAppsController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('Approved Apps'),
    (0, common_1.Controller)('/user/approved-apps'),
    tslib_1.__metadata("design:paramtypes", [oauth_service_1.OAuthService])
], ApprovedAppsController);
//# sourceMappingURL=approved-apps.controller.js.map