"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const throttler_provider_1 = require("@gitroom/nestjs-libraries/throttler/throttler.provider");
const create_org_user_dto_1 = require("@gitroom/nestjs-libraries/dtos/auth/create.org.user.dto");
const login_user_dto_1 = require("@gitroom/nestjs-libraries/dtos/auth/login.user.dto");
const auth_service_1 = require("@gitroom/backend/services/auth/auth.service");
const forgot_return_password_dto_1 = require("@gitroom/nestjs-libraries/dtos/auth/forgot-return.password.dto");
const forgot_password_dto_1 = require("@gitroom/nestjs-libraries/dtos/auth/forgot.password.dto");
const resend_activation_dto_1 = require("@gitroom/nestjs-libraries/dtos/auth/resend-activation.dto");
const swagger_1 = require("@nestjs/swagger");
const subdomain_management_1 = require("@gitroom/helpers/subdomain/subdomain.management");
const email_service_1 = require("@gitroom/nestjs-libraries/services/email.service");
const nestjs_real_ip_1 = require("nestjs-real-ip");
const user_agent_1 = require("@gitroom/nestjs-libraries/user/user.agent");
const client_1 = require("@prisma/client");
const make_secure_id_1 = require("@gitroom/nestjs-libraries/services/make.secure.id");
const Sentry = tslib_1.__importStar(require("@sentry/nestjs"));
const farcaster_provider_1 = require("@gitroom/nestjs-libraries/integrations/social/farcaster.provider");
const attribution_service_1 = require("@gitroom/nestjs-libraries/services/attribution/attribution.service");
let AuthController = class AuthController {
    constructor(_authService, _emailService, _attributionService) {
        this._authService = _authService;
        this._emailService = _emailService;
        this._attributionService = _attributionService;
    }
    async canRegister() {
        return {
            register: await this._authService.canRegister(client_1.Provider.LOCAL),
        };
    }
    attribution() {
        return {
            params: this._attributionService.queryParams(),
        };
    }
    async register(req, body, response, ip, userAgent) {
        try {
            const getOrgFromCookie = this._authService.getOrgFromCookie(req?.cookies?.org);
            const { jwt, addedOrg } = await this._authService.routeAuth(body.provider, body, ip, userAgent, getOrgFromCookie);
            const activationRequired = body.provider === 'LOCAL' && this._emailService.hasProvider();
            if (activationRequired) {
                response.header('activate', 'true');
                response.status(200).json({ activate: true });
                return;
            }
            response.cookie('auth', jwt, {
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
                response.header('auth', jwt);
            }
            if (typeof addedOrg !== 'boolean' && addedOrg?.organizationId) {
                response.cookie('showorg', addedOrg.organizationId, {
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
                    response.header('showorg', addedOrg.organizationId);
                }
            }
            Sentry.metrics.count('new_user', 1);
            response.header('onboarding', 'true');
            response.status(200).json({
                register: true,
            });
        }
        catch (e) {
            response.status(400).send(e.message);
        }
    }
    async login(req, body, response, ip, userAgent) {
        try {
            const getOrgFromCookie = this._authService.getOrgFromCookie(req?.cookies?.org);
            const { jwt, addedOrg } = await this._authService.routeAuth(body.provider, body, ip, userAgent, getOrgFromCookie);
            response.cookie('auth', jwt, {
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
                response.header('auth', jwt);
            }
            if (typeof addedOrg !== 'boolean' && addedOrg?.organizationId) {
                response.cookie('showorg', addedOrg.organizationId, {
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
                    response.header('showorg', addedOrg.organizationId);
                }
            }
            response.header('reload', 'true');
            response.status(200).json({
                login: true,
            });
        }
        catch (e) {
            response.status(400).send(e.message);
        }
    }
    async forgot(body) {
        try {
            await this._authService.forgot(body.email);
            return {
                forgot: true,
            };
        }
        catch (e) {
            return {
                forgot: false,
            };
        }
    }
    async forgotReturn(body) {
        const reset = await this._authService.forgotReturn(body);
        return {
            reset: !!reset,
        };
    }
    mobileCallback(code, state, response) {
        const scheme = process.env.MOBILE_APP_SCHEME || 'postiz://auth/callback';
        const params = new URLSearchParams();
        if (code)
            params.set('code', code);
        if (state)
            params.set('state', state);
        return response.redirect(302, `${scheme}?${params.toString()}`);
    }
    async oauthLink(provider, query, response) {
        const state = `login-${(0, make_secure_id_1.makeSecureId)(16)}`;
        response.cookie('oauth_state', state, {
            domain: (0, subdomain_management_1.getCookieUrlFromDomain)(process.env.FRONTEND_URL),
            ...(!process.env.NOT_SECURED
                ? {
                    secure: true,
                    httpOnly: true,
                    sameSite: 'none',
                }
                : {}),
            expires: new Date(Date.now() + 1000 * 60 * 10),
        });
        return this._authService.oauthLink(provider, { ...query, state });
    }
    async activate(code, datafast_visitor_id, response) {
        const activate = await this._authService.activate(code, datafast_visitor_id);
        if (!activate) {
            return response.status(200).json({ can: false });
        }
        response.cookie('auth', activate, {
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
            response.header('auth', activate);
        }
        response.header('onboarding', 'true');
        return response.status(200).json({ can: true });
    }
    async resendActivation(body) {
        try {
            await this._authService.resendActivationEmail(body.email);
            return {
                success: true,
            };
        }
        catch (e) {
            return {
                success: false,
                message: e.message,
            };
        }
    }
    async farcasterSigner() {
        try {
            return await new farcaster_provider_1.FarcasterProvider().createSigner();
        }
        catch (err) {
            return { error: err.message || 'Failed to create signer' };
        }
    }
    async farcasterSignerStatus(signerUuid) {
        try {
            return await new farcaster_provider_1.FarcasterProvider().signerStatus(signerUuid);
        }
        catch (err) {
            return { error: err.message || 'Failed to check signer' };
        }
    }
    oauthRedirect(provider, code, state, response) {
        if (!code) {
            return response.redirect(303, `${process.env.FRONTEND_URL}/auth/login`);
        }
        const params = new URLSearchParams();
        params.set('code', code);
        if (state)
            params.set('state', state);
        params.set('provider', provider.toUpperCase());
        return response.redirect(303, `${process.env.FRONTEND_URL}/auth?${params.toString()}`);
    }
    async oauthExists(req, code, redirect_uri, state, provider, response) {
        if (!req.headers['content-type']?.includes('application/json')) {
            return response.status(400).send('Invalid request');
        }
        const getOrgFromCookie = this._authService.getOrgFromCookie(req?.cookies?.org);
        const { jwt, token, addedOrg } = await this._authService.checkExists(provider, code, redirect_uri, state, req?.cookies?.oauth_state, getOrgFromCookie);
        if (token) {
            return response.json({ token });
        }
        response.cookie('auth', jwt, {
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
            response.header('auth', jwt);
        }
        if (typeof addedOrg !== 'boolean' && addedOrg?.organizationId) {
            response.cookie('showorg', addedOrg.organizationId, {
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
                response.header('showorg', addedOrg.organizationId);
            }
        }
        response.header('reload', 'true');
        response.status(200).json({
            login: true,
        });
    }
};
exports.AuthController = AuthController;
tslib_1.__decorate([
    (0, common_1.Get)('/can-register'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "canRegister", null);
tslib_1.__decorate([
    (0, common_1.Get)('/attribution'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AuthController.prototype, "attribution", null);
tslib_1.__decorate([
    (0, common_1.Post)('/register'),
    tslib_1.__param(0, (0, common_1.Req)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, common_1.Res)({ passthrough: false })),
    tslib_1.__param(3, (0, nestjs_real_ip_1.RealIP)()),
    tslib_1.__param(4, (0, user_agent_1.UserAgent)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, create_org_user_dto_1.CreateOrgUserDto, Object, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
tslib_1.__decorate([
    (0, common_1.Post)('/login'),
    tslib_1.__param(0, (0, common_1.Req)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, common_1.Res)({ passthrough: false })),
    tslib_1.__param(3, (0, nestjs_real_ip_1.RealIP)()),
    tslib_1.__param(4, (0, user_agent_1.UserAgent)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, login_user_dto_1.LoginUserDto, Object, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
tslib_1.__decorate([
    (0, common_1.Post)('/forgot'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "forgot", null);
tslib_1.__decorate([
    (0, common_1.Post)('/forgot-return'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [forgot_return_password_dto_1.ForgotReturnPasswordDto]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "forgotReturn", null);
tslib_1.__decorate([
    (0, common_1.Get)('/oauth-mobile-callback'),
    tslib_1.__param(0, (0, common_1.Query)('code')),
    tslib_1.__param(1, (0, common_1.Query)('state')),
    tslib_1.__param(2, (0, common_1.Res)({ passthrough: false })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AuthController.prototype, "mobileCallback", null);
tslib_1.__decorate([
    (0, common_1.Get)('/oauth/:provider'),
    tslib_1.__param(0, (0, common_1.Param)('provider')),
    tslib_1.__param(1, (0, common_1.Query)()),
    tslib_1.__param(2, (0, common_1.Res)({ passthrough: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "oauthLink", null);
tslib_1.__decorate([
    (0, common_1.Post)('/activate'),
    tslib_1.__param(0, (0, common_1.Body)('code')),
    tslib_1.__param(1, (0, common_1.Body)('datafast_visitor_id')),
    tslib_1.__param(2, (0, common_1.Res)({ passthrough: false })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "activate", null);
tslib_1.__decorate([
    (0, common_1.Post)('/resend-activation'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [resend_activation_dto_1.ResendActivationDto]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "resendActivation", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(throttler_provider_1.ThrottlerRealIpGuard),
    (0, throttler_1.Throttle)({ default: { limit: 30, ttl: 3600000 } }),
    (0, common_1.Post)('/farcaster/signer'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "farcasterSigner", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(throttler_provider_1.ThrottlerRealIpGuard),
    (0, throttler_1.Throttle)({ default: { limit: 1000, ttl: 3600000 } }),
    (0, common_1.Get)('/farcaster/signer'),
    tslib_1.__param(0, (0, common_1.Query)('signerUuid')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "farcasterSignerStatus", null);
tslib_1.__decorate([
    (0, common_1.Post)('/oauth/:provider/redirect'),
    tslib_1.__param(0, (0, common_1.Param)('provider')),
    tslib_1.__param(1, (0, common_1.Body)('code')),
    tslib_1.__param(2, (0, common_1.Body)('state')),
    tslib_1.__param(3, (0, common_1.Res)({ passthrough: false })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, String, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AuthController.prototype, "oauthRedirect", null);
tslib_1.__decorate([
    (0, common_1.Post)('/oauth/:provider/exists'),
    tslib_1.__param(0, (0, common_1.Req)()),
    tslib_1.__param(1, (0, common_1.Body)('code')),
    tslib_1.__param(2, (0, common_1.Body)('redirect_uri')),
    tslib_1.__param(3, (0, common_1.Body)('state')),
    tslib_1.__param(4, (0, common_1.Param)('provider')),
    tslib_1.__param(5, (0, common_1.Res)({ passthrough: false })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String, String, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "oauthExists", null);
exports.AuthController = AuthController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('/auth'),
    tslib_1.__metadata("design:paramtypes", [auth_service_1.AuthService,
        email_service_1.EmailService,
        attribution_service_1.AttributionService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map