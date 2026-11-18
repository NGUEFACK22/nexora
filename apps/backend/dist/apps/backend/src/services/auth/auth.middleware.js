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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = exports.removeAuth = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../../../../../libraries/helpers/src/auth/auth.service");
const organization_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/organizations/organization.service");
const users_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/users/users.service");
const subdomain_management_1 = require("../../../../../libraries/helpers/src/subdomain/subdomain.management");
const exception_filter_1 = require("../../../../../libraries/nestjs-libraries/src/services/exception.filter");
const initialize_sentry_1 = require("../../../../../libraries/nestjs-libraries/src/sentry/initialize.sentry");
const removeAuth = (res) => {
    res.cookie('auth', '', {
        domain: (0, subdomain_management_1.getCookieUrlFromDomain)(process.env.FRONTEND_URL),
        ...(!process.env.NOT_SECURED
            ? {
                secure: true,
                httpOnly: true,
                sameSite: 'none',
            }
            : {}),
        expires: new Date(0),
        maxAge: -1,
    });
    res.header('logout', 'true');
};
exports.removeAuth = removeAuth;
let AuthMiddleware = class AuthMiddleware {
    constructor(_organizationService, _userService) {
        this._organizationService = _organizationService;
        this._userService = _userService;
    }
    async use(req, res, next) {
        const auth = req.headers.auth || req.cookies.auth;
        if (!auth) {
            throw new exception_filter_1.HttpForbiddenException();
        }
        try {
            const payload = auth_service_1.AuthService.verifyJWT(auth);
            const orgHeader = req.cookies.showorg || req.headers.showorg;
            if (!payload?.id || typeof payload.id !== 'string') {
                throw new exception_filter_1.HttpForbiddenException();
            }
            let user = (await this._userService.getUserById(payload.id));
            if (!user) {
                throw new exception_filter_1.HttpForbiddenException();
            }
            if (!user.activated) {
                throw new exception_filter_1.HttpForbiddenException();
            }
            const impersonate = req.cookies.impersonate || req.headers.impersonate;
            if (user?.isSuperAdmin && impersonate) {
                const loadImpersonate = await this._organizationService.getUserOrg(impersonate);
                if (loadImpersonate) {
                    user = loadImpersonate.user;
                    user.isSuperAdmin = true;
                    delete user.password;
                    req.user = user;
                    loadImpersonate.organization.users =
                        loadImpersonate.organization.users.filter((f) => f.userId === user.id);
                    req.org = loadImpersonate.organization;
                    (0, initialize_sentry_1.setSentryUserContext)({
                        userId: user.id,
                        email: user.email,
                        orgId: loadImpersonate.organization.id,
                        paymentId: loadImpersonate.organization.paymentId,
                    });
                    next();
                    return;
                }
            }
            delete user.password;
            const organization = (await this._organizationService.getOrgsByUserId(user.id)).filter((f) => !f.users[0].disabled);
            const setOrg = organization.find((org) => org.id === orgHeader) ||
                organization.find((org) => org.subscription) ||
                organization[0];
            if (!organization) {
                throw new exception_filter_1.HttpForbiddenException();
            }
            if (!setOrg.apiKey) {
                await this._organizationService.updateApiKey(setOrg.id);
            }
            req.user = user;
            req.org = setOrg;
            (0, initialize_sentry_1.setSentryUserContext)({
                userId: user.id,
                email: user.email,
                orgId: setOrg.id,
                paymentId: setOrg.paymentId,
            });
        }
        catch (err) {
            throw new exception_filter_1.HttpForbiddenException();
        }
        next();
    }
};
exports.AuthMiddleware = AuthMiddleware;
exports.AuthMiddleware = AuthMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [organization_service_1.OrganizationService,
        users_service_1.UsersService])
], AuthMiddleware);
//# sourceMappingURL=auth.middleware.js.map