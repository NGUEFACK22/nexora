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
exports.OAuthAppController = void 0;
const common_1 = require("@nestjs/common");
const org_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/org.from.request");
const swagger_1 = require("@nestjs/swagger");
const oauth_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/oauth/oauth.service");
const permissions_ability_1 = require("../../services/auth/permissions/permissions.ability");
const permission_exception_class_1 = require("../../services/auth/permissions/permission.exception.class");
const create_oauth_app_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/oauth/create-oauth-app.dto");
const update_oauth_app_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/oauth/update-oauth-app.dto");
let OAuthAppController = class OAuthAppController {
    constructor(_oauthService) {
        this._oauthService = _oauthService;
    }
    async getApp(org) {
        return this._oauthService.getApp(org.id);
    }
    async createApp(org, body) {
        return this._oauthService.createApp(org.id, body);
    }
    async updateApp(org, body) {
        return this._oauthService.updateApp(org.id, body);
    }
    async deleteApp(org) {
        return this._oauthService.deleteApp(org.id);
    }
    async rotateSecret(org) {
        return this._oauthService.rotateSecret(org.id);
    }
};
exports.OAuthAppController = OAuthAppController;
__decorate([
    (0, common_1.Get)('/'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OAuthAppController.prototype, "getApp", null);
__decorate([
    (0, common_1.Post)('/'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_oauth_app_dto_1.CreateOAuthAppDto]),
    __metadata("design:returntype", Promise)
], OAuthAppController.prototype, "createApp", null);
__decorate([
    (0, common_1.Put)('/'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_oauth_app_dto_1.UpdateOAuthAppDto]),
    __metadata("design:returntype", Promise)
], OAuthAppController.prototype, "updateApp", null);
__decorate([
    (0, common_1.Delete)('/'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OAuthAppController.prototype, "deleteApp", null);
__decorate([
    (0, common_1.Post)('/rotate-secret'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OAuthAppController.prototype, "rotateSecret", null);
exports.OAuthAppController = OAuthAppController = __decorate([
    (0, swagger_1.ApiTags)('OAuth App'),
    (0, common_1.Controller)('/user/oauth-app'),
    __metadata("design:paramtypes", [oauth_service_1.OAuthService])
], OAuthAppController);
//# sourceMappingURL=oauth-app.controller.js.map