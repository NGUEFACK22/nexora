"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const org_from_request_1 = require("@gitroom/nestjs-libraries/user/org.from.request");
const user_from_request_1 = require("@gitroom/nestjs-libraries/user/user.from.request");
const permissions_ability_1 = require("@gitroom/backend/services/auth/permissions/permissions.ability");
const organization_service_1 = require("@gitroom/nestjs-libraries/database/prisma/organizations/organization.service");
const add_team_member_dto_1 = require("@gitroom/nestjs-libraries/dtos/settings/add.team.member.dto");
const admin_add_team_member_dto_1 = require("@gitroom/nestjs-libraries/dtos/settings/admin.add.team.member.dto");
const shortlink_preference_dto_1 = require("@gitroom/nestjs-libraries/dtos/settings/shortlink-preference.dto");
const swagger_1 = require("@nestjs/swagger");
const permission_exception_class_1 = require("@gitroom/backend/services/auth/permissions/permission.exception.class");
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
tslib_1.__decorate([
    (0, common_1.Get)('/team'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.TEAM_MEMBERS], [permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SettingsController.prototype, "getTeam", null);
tslib_1.__decorate([
    (0, common_1.Post)('/team'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.TEAM_MEMBERS], [permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, user_from_request_1.GetUserFromRequest)()),
    tslib_1.__param(2, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, add_team_member_dto_1.AddTeamMemberDto]),
    tslib_1.__metadata("design:returntype", Promise)
], SettingsController.prototype, "inviteTeamMember", null);
tslib_1.__decorate([
    (0, common_1.Post)('/team/add'),
    tslib_1.__param(0, (0, user_from_request_1.GetUserFromRequest)()),
    tslib_1.__param(1, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(2, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, admin_add_team_member_dto_1.AdminAddTeamMemberDto]),
    tslib_1.__metadata("design:returntype", Promise)
], SettingsController.prototype, "addTeamMember", null);
tslib_1.__decorate([
    (0, common_1.Delete)('/team/:id'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.TEAM_MEMBERS], [permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", void 0)
], SettingsController.prototype, "deleteTeamMember", null);
tslib_1.__decorate([
    (0, common_1.Get)('/shortlink'),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SettingsController.prototype, "getShortlinkPreference", null);
tslib_1.__decorate([
    (0, common_1.Post)('/shortlink'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, shortlink_preference_dto_1.ShortlinkPreferenceDto]),
    tslib_1.__metadata("design:returntype", Promise)
], SettingsController.prototype, "updateShortlinkPreference", null);
exports.SettingsController = SettingsController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('Settings'),
    (0, common_1.Controller)('/settings'),
    tslib_1.__metadata("design:paramtypes", [organization_service_1.OrganizationService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map