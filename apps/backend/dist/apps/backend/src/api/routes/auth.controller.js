"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const throttler_provider_1 = require("../../../../../libraries/nestjs-libraries/src/throttler/throttler.provider");
const create_org_user_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/auth/create.org.user.dto");
const login_user_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/auth/login.user.dto");
const auth_service_1 = require("../../services/auth/auth.service");
const forgot_return_password_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/auth/forgot-return.password.dto");
const forgot_password_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/auth/forgot.password.dto");
const resend_activation_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/auth/resend-activation.dto");
const swagger_1 = require("@nestjs/swagger");
const subdomain_management_1 = require("../../../../../libraries/helpers/src/subdomain/subdomain.management");
const email_service_1 = require("../../../../../libraries/nestjs-libraries/src/services/email.service");
const nestjs_real_ip_1 = require("nestjs-real-ip");
const user_agent_1 = require("../../../../../libraries/nestjs-libraries/src/user/user.agent");
const client_1 = require("@prisma/client");
const make_secure_id_1 = require("../../../../../libraries/nestjs-libraries/src/services/make.secure.id");
const Sentry = __importStar(require("@sentry/nestjs"));
const farcaster_provider_1 = require("../../../../../libraries/nestjs-libraries/src/integrations/social/farcaster.provider");
const attribution_service_1 = require("../../../../../libraries/nestjs-libraries/src/services/attribution/attribution.service");
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
__decorate([
    (0, common_1.Get)('/can-register'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "canRegister", null);
__decorate([
    (0, common_1.Get)('/attribution'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "attribution", null);
__decorate([
    (0, common_1.Post)('/register'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)({ passthrough: false })),
    __param(3, (0, nestjs_real_ip_1.RealIP)()),
    __param(4, (0, user_agent_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_org_user_dto_1.CreateOrgUserDto, Object, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('/login'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)({ passthrough: false })),
    __param(3, (0, nestjs_real_ip_1.RealIP)()),
    __param(4, (0, user_agent_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, login_user_dto_1.LoginUserDto, Object, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('/forgot'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgot", null);
__decorate([
    (0, common_1.Post)('/forgot-return'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_return_password_dto_1.ForgotReturnPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotReturn", null);
__decorate([
    (0, common_1.Get)('/oauth-mobile-callback'),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('state')),
    __param(2, (0, common_1.Res)({ passthrough: false })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "mobileCallback", null);
__decorate([
    (0, common_1.Get)('/oauth/:provider'),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "oauthLink", null);
__decorate([
    (0, common_1.Post)('/activate'),
    __param(0, (0, common_1.Body)('code')),
    __param(1, (0, common_1.Body)('datafast_visitor_id')),
    __param(2, (0, common_1.Res)({ passthrough: false })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)('/resend-activation'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resend_activation_dto_1.ResendActivationDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendActivation", null);
__decorate([
    (0, common_1.UseGuards)(throttler_provider_1.ThrottlerRealIpGuard),
    (0, throttler_1.Throttle)({ default: { limit: 30, ttl: 3600000 } }),
    (0, common_1.Post)('/farcaster/signer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "farcasterSigner", null);
__decorate([
    (0, common_1.UseGuards)(throttler_provider_1.ThrottlerRealIpGuard),
    (0, throttler_1.Throttle)({ default: { limit: 1000, ttl: 3600000 } }),
    (0, common_1.Get)('/farcaster/signer'),
    __param(0, (0, common_1.Query)('signerUuid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "farcasterSignerStatus", null);
__decorate([
    (0, common_1.Post)('/oauth/:provider/redirect'),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Body)('code')),
    __param(2, (0, common_1.Body)('state')),
    __param(3, (0, common_1.Res)({ passthrough: false })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "oauthRedirect", null);
__decorate([
    (0, common_1.Post)('/oauth/:provider/exists'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('code')),
    __param(2, (0, common_1.Body)('redirect_uri')),
    __param(3, (0, common_1.Body)('state')),
    __param(4, (0, common_1.Param)('provider')),
    __param(5, (0, common_1.Res)({ passthrough: false })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "oauthExists", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('/auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        email_service_1.EmailService,
        attribution_service_1.AttributionService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map