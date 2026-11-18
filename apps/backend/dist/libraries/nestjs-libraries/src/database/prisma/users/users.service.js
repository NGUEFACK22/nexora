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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const users_repository_1 = require("./users.repository");
const client_1 = require("@prisma/client");
const organization_repository_1 = require("../organizations/organization.repository");
const integration_repository_1 = require("../integrations/integration.repository");
const notification_service_1 = require("../notifications/notification.service");
let UsersService = UsersService_1 = class UsersService {
    constructor(_usersRepository, _organizationRepository, _integrationRepository, _notificationService) {
        this._usersRepository = _usersRepository;
        this._organizationRepository = _organizationRepository;
        this._integrationRepository = _integrationRepository;
        this._notificationService = _notificationService;
        this._logger = new common_1.Logger(UsersService_1.name);
    }
    getUserByEmail(email) {
        return this._usersRepository.getUserByEmail(email);
    }
    getUserById(id) {
        return this._usersRepository.getUserById(id);
    }
    getUserWithActiveSubscriptionByEmail(email, excludeUserId) {
        return this._usersRepository.getUserWithActiveSubscriptionByEmail(email, excludeUserId);
    }
    getImpersonateUser(name) {
        return this._organizationRepository.getImpersonateUser(name);
    }
    getUserByProvider(providerId, provider) {
        return this._usersRepository.getUserByProvider(providerId, provider);
    }
    async switchUser(currentUserId, targetUserId, adminId) {
        const { kept, switched } = await this._usersRepository.switchUserCredentials(currentUserId, targetUserId);
        this._logger.log(`User login switch performed by admin ${adminId}: account ${kept.id} login ${switched.email} -> ${kept.email}; account ${switched.id} login ${kept.email} -> ${switched.email}`);
        if (this._notificationService.hasEmailProvider()) {
            await Promise.all([kept, switched].map((account) => this._notificationService
                .sendEmail(account.email, 'Your Nexora login was changed', `An administrator changed the login for your Nexora account. ` +
                `You can now sign in using ${account.email}. ` +
                `Your subscription and plan were not changed by this switch — ` +
                `if you intended to cancel a subscription, please do that ` +
                `separately from your billing settings.`)
                .catch((err) => this._logger.error(`Failed to notify ${account.email}`, err))));
        }
        return { kept, switched };
    }
    async getOrgsToDeleteForAccount(userId) {
        const orgs = await this._organizationRepository.getOrgsByUserId(userId);
        const ownedOrgs = orgs.filter((org) => org.users[0].role === client_1.Role.SUPERADMIN);
        const teams = await Promise.all(ownedOrgs.map((org) => this._organizationRepository.getTeam(org.id)));
        return ownedOrgs.filter((org, index) => !teams[index]?.users?.some((member) => member.user.id !== userId && member.role === client_1.Role.SUPERADMIN));
    }
    async getDeleteAccountInfo(userId) {
        const ownedOrgs = await this.getOrgsToDeleteForAccount(userId);
        const teams = await Promise.all(ownedOrgs.map((org) => this._organizationRepository.getTeam(org.id)));
        return {
            hasSubscription: ownedOrgs.some((org) => !!org.subscription),
            hasAdditionalMembers: teams.some((team) => team?.users?.some((member) => member.user.id !== userId)),
        };
    }
    async deleteAccount(userId) {
        const deletedOrgs = await this.getOrgsToDeleteForAccount(userId);
        const orgs = await this._organizationRepository.getOrgsByUserId(userId);
        for (const org of orgs) {
            if (deletedOrgs.some((deletedOrg) => deletedOrg.id === org.id)) {
                const team = await this._organizationRepository.getTeam(org.id);
                for (const member of team?.users || []) {
                    if (member.user.id !== userId) {
                        await this._organizationRepository.deleteTeamMember(org.id, member.user.id);
                    }
                }
                await this._integrationRepository.deleteIntegrationsForAccount(org.id);
                await this._organizationRepository.deleteOrganization(org.id);
            }
            else {
                await this._organizationRepository.deleteTeamMember(org.id, userId);
            }
        }
        await this._usersRepository.deleteAccount(userId);
        this._logger.log(`Account ${userId} deleted, organizations removed: ${deletedOrgs
            .map((org) => org.id)
            .join(', ')}`);
        return { deletedOrgs };
    }
    activateUser(id) {
        return this._usersRepository.activateUser(id);
    }
    updatePassword(id, password) {
        return this._usersRepository.updatePassword(id, password);
    }
    getPersonal(userId) {
        return this._usersRepository.getPersonal(userId);
    }
    changePersonal(userId, body) {
        return this._usersRepository.changePersonal(userId, body);
    }
    getEmailNotifications(userId) {
        return this._usersRepository.getEmailNotifications(userId);
    }
    updateEmailNotifications(userId, body) {
        return this._usersRepository.updateEmailNotifications(userId, body);
    }
    updateTimezone(userId, body) {
        return this._usersRepository.updateTimezone(userId, body);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository,
        organization_repository_1.OrganizationRepository,
        integration_repository_1.IntegrationRepository,
        notification_service_1.NotificationService])
], UsersService);
//# sourceMappingURL=users.service.js.map