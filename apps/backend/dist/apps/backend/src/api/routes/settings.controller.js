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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const org_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/org.from.request");
const user_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/user.from.request");
const permissions_ability_1 = require("../../services/auth/permissions/permissions.ability");
const organization_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/organizations/organization.service");
const add_team_member_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/settings/add.team.member.dto");
const admin_add_team_member_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/settings/admin.add.team.member.dto");
const shortlink_preference_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/settings/shortlink-preference.dto");
const swagger_1 = require("@nestjs/swagger");
const permission_exception_class_1 = require("../../services/auth/permissions/permission.exception.class");
let SettingsController = class SettingsController {
    constructor(_organizationService) {
        this._organizationService = _organizationService;
    }
    async getTeam(org) {
        return this._organizationService.getTeam(org.id);
    }
    async inviteTeamMember(org, user, body) {
        return this._organizationService.inviteTeamMember(org, user, body);
    }
    async addTeamMember(user, org, body) {
        if (!user.isSuperAdmin) {
            throw new common_1.HttpException('Unauthorized', 400);
        }
        return this._organizationService.addTeamMemberByEmail(org, body);
    }
    deleteTeamMember(org, id) {
        return this._organizationService.deleteTeamMember(org, id);
    }
    async getShortlinkPreference(org) {
        return this._organizationService.getShortlinkPreference(org.id);
    }
    async updateShortlinkPreference(org, body) {
        return this._organizationService.updateShortlinkPreference(org.id, body.shortlink);
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)('/team'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.TEAM_MEMBERS], [permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getTeam", null);
__decorate([
    (0, common_1.Post)('/team'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.TEAM_MEMBERS], [permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, user_from_request_1.GetUserFromRequest)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, add_team_member_dto_1.AddTeamMemberDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "inviteTeamMember", null);
__decorate([
    (0, common_1.Post)('/team/add'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, admin_add_team_member_dto_1.AdminAddTeamMemberDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "addTeamMember", null);
__decorate([
    (0, common_1.Delete)('/team/:id'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.TEAM_MEMBERS], [permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "deleteTeamMember", null);
__decorate([
    (0, common_1.Get)('/shortlink'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getShortlinkPreference", null);
__decorate([
    (0, common_1.Post)('/shortlink'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, shortlink_preference_dto_1.ShortlinkPreferenceDto]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateShortlinkPreference", null);
exports.SettingsController = SettingsController = __decorate([
    (0, swagger_1.ApiTags)('Settings'),
    (0, common_1.Controller)('/settings'),
    __metadata("design:paramtypes", [organization_service_1.OrganizationService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map