"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const organization_repository_1 = require("@gitroom/nestjs-libraries/database/prisma/organizations/organization.repository");
const notification_service_1 = require("@gitroom/nestjs-libraries/database/prisma/notifications/notification.service");
const pricing_1 = require("@gitroom/nestjs-libraries/database/prisma/subscriptions/pricing");
const auth_service_1 = require("@gitroom/helpers/auth/auth.service");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const make_is_1 = require("@gitroom/nestjs-libraries/services/make.is");
let OrganizationService = class OrganizationService {
    constructor(_organizationRepository, _notificationsService) {
        this._organizationRepository = _organizationRepository;
        this._notificationsService = _notificationsService;
    }
    async createOrgAndUser(body, ip, userAgent) {
        return this._organizationRepository.createOrgAndUser(body, this._notificationsService.hasEmailProvider(), ip, userAgent);
    }
    async getCount() {
        return this._organizationRepository.getCount();
    }
    async createMaxUser(id, name, saasName, email) {
        return this._organizationRepository.createMaxUser(id, name, saasName, email);
    }
    addUserToOrg(userId, id, orgId, role) {
        return this._organizationRepository.addUserToOrg(userId, id, orgId, role);
    }
    getOrgById(id) {
        return this._organizationRepository.getOrgById(id);
    }
    getOrgByIdWithSubscription(id) {
        return this._organizationRepository.getOrgByIdWithSubscription(id);
    }
    getAccountOverview(orgId) {
        return this._organizationRepository.getAccountOverview(orgId);
    }
    getOrgByApiKey(api) {
        return this._organizationRepository.getOrgByApiKey(api);
    }
    async canUseSuperAdminApi(orgId) {
        const [superAdmin, privilegedOther] = await Promise.all([
            this._organizationRepository.getSuperAdminUser(orgId),
            this._organizationRepository.getPrivilegedNonSuperAdminUser(orgId),
        ]);
        return !!superAdmin && !privilegedOther;
    }
    getUserOrg(id) {
        return this._organizationRepository.getUserOrg(id);
    }
    getOrgsByUserId(userId) {
        return this._organizationRepository.getOrgsByUserId(userId);
    }
    updateApiKey(orgId) {
        return this._organizationRepository.updateApiKey(orgId);
    }
    getTeam(orgId) {
        return this._organizationRepository.getTeam(orgId);
    }
    async setStreak(organizationId, type) {
        return this._organizationRepository.setStreak(organizationId, type);
    }
    async getLastPublishDate(organizationId) {
        return this._organizationRepository.getLastPublishDate(organizationId);
    }
    getOrgByCustomerId(customerId) {
        return this._organizationRepository.getOrgByCustomerId(customerId);
    }
    async inviteTeamMember(org, user, body) {
        const timeLimit = (0, dayjs_1.default)().add(2, 'day').format('YYYY-MM-DD HH:mm:ss');
        const id = (0, make_is_1.makeId)(5);
        const url = process.env.FRONTEND_URL +
            `/?org=${auth_service_1.AuthService.signJWT({
                email: body.email,
                role: body.role,
                orgId: org.id,
                timeLimit,
                id,
            })}`;
        if (body.sendEmail) {
            const inviter = user.name
                ? `${user.name} (${user.email})`
                : user.email;
            await this._notificationsService.sendEmail(body.email, `${user.name || user.email} invited you to join "${org.name}"`, `${inviter} has invited you to join the "${org.name}" team.<br /><a href="${url}">Accept the invitation</a> to get started.<br />The link will expire in 2 days.`);
        }
        return { url };
    }
    async addTeamMemberByEmail(org, body) {
        const tier = org?.subscription?.subscriptionTier ||
            (!process.env.STRIPE_PUBLISHABLE_KEY ? 'ULTIMATE' : 'FREE');
        if (!pricing_1.pricing[tier].team_members) {
            throw new common_1.HttpException('The organization plan does not include team members', 400);
        }
        const users = await this._organizationRepository.getUsersByEmail(body.email);
        if (!users.length) {
            throw new common_1.HttpException('No Nexora account found for this email', 400);
        }
        if (users.length > 1) {
            throw new common_1.HttpException('Multiple accounts exist for this email (different login providers)', 400);
        }
        const [user] = users;
        const userOrgs = await this._organizationRepository.getOrgsByUserId(user.id);
        if (userOrgs.some((current) => current.id === org.id)) {
            throw new common_1.HttpException('User is already a member of this organization', 400);
        }
        const added = await this._organizationRepository.addUserToOrg(user.id, (0, make_is_1.makeId)(5), org.id, body.role);
        if (!added) {
            throw new common_1.HttpException('Could not add the user to the organization', 400);
        }
        return { added: true };
    }
    async deleteTeamMember(org, userId) {
        const userOrgs = await this._organizationRepository.getOrgsByUserId(userId);
        const findOrgToDelete = userOrgs.find((orgUser) => orgUser.id === org.id);
        if (!findOrgToDelete) {
            throw new Error('User is not part of this organization');
        }
        const myRole = org.users[0].role;
        const userRole = findOrgToDelete.users[0].role;
        const myLevel = myRole === 'USER' ? 0 : myRole === 'ADMIN' ? 1 : 2;
        const userLevel = userRole === 'USER' ? 0 : userRole === 'ADMIN' ? 1 : 2;
        if (myLevel < userLevel) {
            throw new Error('You do not have permission to delete this user');
        }
        return this._organizationRepository.deleteTeamMember(org.id, userId);
    }
    disableOrEnableNonSuperAdminUsers(orgId, disable) {
        return this._organizationRepository.disableOrEnableNonSuperAdminUsers(orgId, disable);
    }
    getShortlinkPreference(orgId) {
        return this._organizationRepository.getShortlinkPreference(orgId);
    }
    updateShortlinkPreference(orgId, shortlink) {
        return this._organizationRepository.updateShortlinkPreference(orgId, shortlink);
    }
};
exports.OrganizationService = OrganizationService;
exports.OrganizationService = OrganizationService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [organization_repository_1.OrganizationRepository,
        notification_service_1.NotificationService])
], OrganizationService);
//# sourceMappingURL=organization.service.js.map