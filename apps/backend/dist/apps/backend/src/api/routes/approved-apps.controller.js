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
exports.ApprovedAppsController = void 0;
const common_1 = require("@nestjs/common");
const user_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/user.from.request");
const swagger_1 = require("@nestjs/swagger");
const oauth_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/oauth/oauth.service");
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
__decorate([
    (0, common_1.Get)('/'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApprovedAppsController.prototype, "list", null);
__decorate([
    (0, common_1.Delete)('/:id'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ApprovedAppsController.prototype, "revoke", null);
exports.ApprovedAppsController = ApprovedAppsController = __decorate([
    (0, swagger_1.ApiTags)('Approved Apps'),
    (0, common_1.Controller)('/user/approved-apps'),
    __metadata("design:paramtypes", [oauth_service_1.OAuthService])
], ApprovedAppsController);
//# sourceMappingURL=approved-apps.controller.js.map