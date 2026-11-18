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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const user_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/user.from.request");
const jsonwebtoken_1 = require("jsonwebtoken");
const subscription_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/subscriptions/subscription.service");
const org_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/org.from.request");
const payment_service_1 = require("../../../../../libraries/nestjs-libraries/src/services/payment/payment.service");
const auth_service_1 = require("../../services/auth/auth.service");
const auth_service_2 = require("../../../../../libraries/helpers/src/auth/auth.service");
const organization_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/organizations/organization.service");
const permissions_ability_1 = require("../../services/auth/permissions/permissions.ability");
const subdomain_management_1 = require("../../../../../libraries/helpers/src/subdomain/subdomain.management");
const pricing_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/subscriptions/pricing");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/users/users.service");
const user_details_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/users/user.details.dto");
const email_notifications_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/users/email-notifications.dto");
const timezone_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/users/timezone.dto");
const exception_filter_1 = require("../../../../../libraries/nestjs-libraries/src/services/exception.filter");
const nestjs_real_ip_1 = require("nestjs-real-ip");
const user_agent_1 = require("../../../../../libraries/nestjs-libraries/src/user/user.agent");
const track_service_1 = require("../../../../../libraries/nestjs-libraries/src/track/track.service");
const track_cookies_1 = require("../../../../../libraries/nestjs-libraries/src/track/track.cookies");
const permission_exception_class_1 = require("../../services/auth/permissions/permission.exception.class");
let UsersController = class UsersController {
    constructor(_subscriptionService, _paymentService, _authService, _orgService, _userService, _trackService) {
        this._subscriptionService = _subscriptionService;
        this._paymentService = _paymentService;
        this._authService = _authService;
        this._orgService = _orgService;
        this._userService = _userService;
        this._trackService = _trackService;
    }
    async getChatbaseToken(user, organization) {
        if (!process.env.CHATBASE_TOKEN) {
            throw new common_1.HttpException('Chatbase SSO is not configured', 400);
        }
        const token = (0, jsonwebtoken_1.sign)({
            user_id: organization.id,
            email: user.email,
            ...(organization.paymentId
                ? {
                    stripe_accounts: [
                        {
                            label: organization.name,
                            stripe_id: organization.paymentId,
                        },
                    ],
                }
                : {}),
        }, process.env.CHATBASE_TOKEN, { expiresIn: '1h' });
        return { token };
    }
    async getSelf(user, organization, req) {
        if (!organization) {
            throw new exception_filter_1.HttpForbiddenException();
        }
        const impersonate = req.cookies.impersonate || req.headers.impersonate;
        return {
            ...user,
            orgId: organization.id,
            totalChannels: !process.env.STRIPE_PUBLISHABLE_KEY
                ? 10000
                :
                    organization?.subscription?.totalChannels || pricing_1.pricing.FREE.channel,
            tier: organization?.subscription?.subscriptionTier ||
                (!process.env.STRIPE_PUBLISHABLE_KEY ? 'ULTIMATE' : 'FREE'),
            role: organization?.users[0]?.role,
            isLifetime: !!organization?.subscription?.isLifetime,
            admin: !!user.isSuperAdmin,
            impersonate: !!impersonate,
            isTrailing: !process.env.STRIPE_PUBLISHABLE_KEY
                ? false
                : organization?.isTrailing,
            allowTrial: organization?.allowTrial,
            streakSince: organization?.streakSince || null,
            publicApi: organization?.users[0]?.role === 'SUPERADMIN' ||
                organization?.users[0]?.role === 'ADMIN'
                ? organization?.apiKey
                : '',
        };
    }
    async getPersonalInformation(user) {
        return this._userService.getPersonal(user.id);
    }
    async getImpersonate(user, name) {
        if (!user.isSuperAdmin) {
            throw new common_1.HttpException('Unauthorized', 400);
        }
        return this._userService.getImpersonateUser(name);
    }
    async setImpersonate(user, id, response) {
        if (!user.isSuperAdmin) {
            throw new common_1.HttpException('Unauthorized', 400);
        }
        response.cookie('impersonate', id, {
            domain: (0, subdomain_management_1.getCookieUrlFromDomain)(process.env.FRONTEND_URL),
            ...(!process.env.NOT_SECURED
                ? {
                    secure: true,
                    httpOnly: true,
                    sameSite: 'none',
                }
                : {}),
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        });
        if (process.env.NOT_SECURED) {
            response.header('impersonate', id);
        }
    }
    async switchUser(user, id, req) {
        if (!user.isSuperAdmin) {
            throw new common_1.HttpException('Unauthorized', 400);
        }
        const adminId = this.getRequestUserId(req);
        if (!id ||
            !adminId ||
            id === user.id ||
            adminId === user.id ||
            adminId === id) {
            throw new common_1.HttpException('Invalid user to switch to', 400);
        }
        const { kept, switched } = await this._userService.switchUser(user.id, id, adminId);
        await this._paymentService.syncCustomerEmailsAfterSwitch([kept, switched]);
        return { success: true };
    }
    getRequestUserId(req) {
        try {
            const auth = req.headers.auth || req.cookies?.auth;
            const payload = auth_service_2.AuthService.verifyJWT(auth);
            return payload?.id || null;
        }
        catch {
            return null;
        }
    }
    async changePersonal(user, body) {
        return this._userService.changePersonal(user.id, body);
    }
    async getEmailNotifications(user) {
        return this._userService.getEmailNotifications(user.id);
    }
    async updateEmailNotifications(user, body) {
        return this._userService.updateEmailNotifications(user.id, body);
    }
    async updateTimezone(user, body) {
        return this._userService.updateTimezone(user.id, body);
    }
    async rotateApiKey(organization) {
        return this._orgService.updateApiKey(organization.id);
    }
    async getSubscription(organization) {
        const subscription = await this._paymentService.getSubscription(organization.id);
        return subscription ? { subscription } : { subscription: undefined };
    }
    async tiers() {
        return this._paymentService.getDefaultProvider('web').getPackages();
    }
    async joinOrg(user, org, response) {
        const getOrgFromCookie = this._authService.getOrgFromCookie(org);
        if (!getOrgFromCookie) {
            return response.status(200).json({ id: null });
        }
        const addedOrg = await this._orgService.addUserToOrg(user.id, getOrgFromCookie.id, getOrgFromCookie.orgId, getOrgFromCookie.role);
        response.status(200).json({
            id: typeof addedOrg !== 'boolean' ? addedOrg.organizationId : null,
        });
    }
    async getOrgs(user) {
        return (await this._orgService.getOrgsByUserId(user.id))
            .filter((f) => !f.users[0].disabled)
            .map((p) => ({
            id: p.id,
            name: p.name,
            users: p.users,
            subscription: p.subscription,
        }));
    }
    changeOrg(id, response) {
        response.cookie('showorg', id, {
            domain: (0, subdomain_management_1.getCookieUrlFromDomain)(process.env.FRONTEND_URL),
            ...(!process.env.NOT_SECURED
                ? {
                    secure: true,
                    httpOnly: true,
                    sameSite: 'none',
                }
                : {}),
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        });
        if (process.env.NOT_SECURED) {
            response.header('showorg', id);
        }
        response.status(200).send();
    }
    getDeleteAccountInfo(user) {
        return this._userService.getDeleteAccountInfo(user.id);
    }
    async deleteAccount(user, req, response) {
        const impersonate = req.cookies.impersonate || req.headers.impersonate;
        if (impersonate) {
            throw new common_1.HttpException('Account cannot be deleted while impersonating', 400);
        }
        const ownedOrgs = await this._userService.getOrgsToDeleteForAccount(user.id);
        for (const org of ownedOrgs) {
            try {
                await this._paymentService.cancelAllSubscriptions(org.id);
            }
            catch (err) {
                console.log(err);
                throw new common_1.HttpException('Could not cancel your subscription, please try again or contact support', 400);
            }
        }
        await this._userService.deleteAccount(user.id);
        return this.logout(response);
    }
    logout(response) {
        response.header('logout', 'true');
        response.cookie('auth', '', {
            domain: (0, subdomain_management_1.getCookieUrlFromDomain)(process.env.FRONTEND_URL),
            ...(!process.env.NOT_SECURED
                ? {
                    secure: true,
                    httpOnly: true,
                    sameSite: 'none',
                }
                : {}),
            maxAge: -1,
            expires: new Date(0),
        });
        response.cookie('showorg', '', {
            domain: (0, subdomain_management_1.getCookieUrlFromDomain)(process.env.FRONTEND_URL),
            ...(!process.env.NOT_SECURED
                ? {
                    secure: true,
                    httpOnly: true,
                    sameSite: 'none',
                }
                : {}),
            maxAge: -1,
            expires: new Date(0),
        });
        response.cookie('impersonate', '', {
            domain: (0, subdomain_management_1.getCookieUrlFromDomain)(process.env.FRONTEND_URL),
            ...(!process.env.NOT_SECURED
                ? {
                    secure: true,
                    httpOnly: true,
                    sameSite: 'none',
                }
                : {}),
            maxAge: -1,
            expires: new Date(0),
        });
        response.status(200).send();
    }
    async trackEvent(res, req, user, ip, userAgent, body) {
        const { uniqueId, fbc, fbp } = (0, track_cookies_1.applyTrackCookies)(req, res, body.fbclid);
        this._trackService
            .track(uniqueId, ip, userAgent, body.tt, body.additional, fbc, user, fbp)
            .catch((err) => { });
        res.status(200).json({
            track: uniqueId,
        });
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('/chatbase-token'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getChatbaseToken", null);
__decorate([
    (0, common_1.Get)('/self'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getSelf", null);
__decorate([
    (0, common_1.Get)('/personal'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getPersonalInformation", null);
__decorate([
    (0, common_1.Get)('/impersonate'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getImpersonate", null);
__decorate([
    (0, common_1.Post)('/impersonate'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, common_1.Body)('id')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "setImpersonate", null);
__decorate([
    (0, common_1.Post)('/switch'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, common_1.Body)('id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "switchUser", null);
__decorate([
    (0, common_1.Post)('/personal'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_details_dto_1.UserDetailDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePersonal", null);
__decorate([
    (0, common_1.Get)('/email-notifications'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getEmailNotifications", null);
__decorate([
    (0, common_1.Post)('/email-notifications'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, email_notifications_dto_1.EmailNotificationsDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateEmailNotifications", null);
__decorate([
    (0, common_1.Post)('/timezone'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, timezone_dto_1.TimezoneDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateTimezone", null);
__decorate([
    (0, common_1.Post)('/api-key/rotate'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "rotateApiKey", null);
__decorate([
    (0, common_1.Get)('/subscription'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getSubscription", null);
__decorate([
    (0, common_1.Get)('/subscription/tiers'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.ADMIN]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "tiers", null);
__decorate([
    (0, common_1.Post)('/join-org'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, common_1.Body)('org')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "joinOrg", null);
__decorate([
    (0, common_1.Get)('/organizations'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getOrgs", null);
__decorate([
    (0, common_1.Post)('/change-org'),
    __param(0, (0, common_1.Body)('id')),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "changeOrg", null);
__decorate([
    (0, common_1.Get)('/delete-account-info'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getDeleteAccountInfo", null);
__decorate([
    (0, common_1.Post)('/delete-account'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteAccount", null);
__decorate([
    (0, common_1.Post)('/logout'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('/t'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, user_from_request_1.GetUserFromRequest)()),
    __param(3, (0, nestjs_real_ip_1.RealIP)()),
    __param(4, (0, user_agent_1.UserAgent)()),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "trackEvent", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('User'),
    (0, common_1.Controller)('/user'),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService,
        payment_service_1.PaymentService,
        auth_service_1.AuthService,
        organization_service_1.OrganizationService,
        users_service_1.UsersService,
        track_service_1.TrackService])
], UsersController);
//# sourceMappingURL=users.controller.js.map