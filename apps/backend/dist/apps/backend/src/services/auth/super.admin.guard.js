"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminGuard = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const organization_service_1 = require("@gitroom/nestjs-libraries/database/prisma/organizations/organization.service");
let SuperAdminGuard = class SuperAdminGuard {
    constructor(_organizationService) {
        this._organizationService = _organizationService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const { org, isOAuthApp, authOrgId, } = request;
        const orgId = authOrgId || org?.id;
        if (!orgId ||
            isOAuthApp ||
            !(await this._organizationService.canUseSuperAdminApi(orgId))) {
            throw new common_1.HttpException({ msg: 'Unauthorized' }, 403);
        }
        return true;
    }
};
exports.SuperAdminGuard = SuperAdminGuard;
exports.SuperAdminGuard = SuperAdminGuard = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [organization_service_1.OrganizationService])
], SuperAdminGuard);
//# sourceMappingURL=super.admin.guard.js.map