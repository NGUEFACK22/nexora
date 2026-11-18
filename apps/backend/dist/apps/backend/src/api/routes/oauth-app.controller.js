"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthAppController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const org_from_request_1 = require("@gitroom/nestjs-libraries/user/org.from.request");
const swagger_1 = require("@nestjs/swagger");
const oauth_service_1 = require("@gitroom/nestjs-libraries/database/prisma/oauth/oauth.service");
const permissions_ability_1 = require("@gitroom/backend/services/auth/permissions/permissions.ability");
const permission_exception_class_1 = require("@gitroom/backend/services/auth/permissions/permission.exception.class");
const create_oauth_app_dto_1 = require("@gitroom/nestjs-libraries/dtos/oauth/create-oauth-app.dto");
const update_oauth_app_dto_1 = require("@gitroom/nestjs-libraries/dtos/oauth/update-oauth-app.dto");
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
tslib_1.__decorate([
    (0, common_1.Get)('/'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OAuthAppController.prototype, "getApp", null);
tslib_1.__decorate([
    (0, common_1.Post)('/'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, create_oauth_app_dto_1.CreateOAuthAppDto]),
    tslib_1.__metadata("design:returntype", Promise)
], OAuthAppController.prototype, "createApp", null);
tslib_1.__decorate([
    (0, common_1.Put)('/'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, update_oauth_app_dto_1.UpdateOAuthAppDto]),
    tslib_1.__metadata("design:returntype", Promise)
], OAuthAppController.prototype, "updateApp", null);
tslib_1.__decorate([
    (0, common_1.Delete)('/'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OAuthAppController.prototype, "deleteApp", null);
tslib_1.__decorate([
    (0, common_1.Post)('/rotate-secret'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OAuthAppController.prototype, "rotateSecret", null);
exports.OAuthAppController = OAuthAppController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('OAuth App'),
    (0, common_1.Controller)('/user/oauth-app'),
    tslib_1.__metadata("design:paramtypes", [oauth_service_1.OAuthService])
], OAuthAppController);
//# sourceMappingURL=oauth-app.controller.js.map