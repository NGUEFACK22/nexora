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
exports.OAuthAuthorizedController = exports.OAuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const oauth_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/oauth/oauth.service");
const user_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/user.from.request");
const org_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/org.from.request");
const authorize_oauth_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/oauth/authorize-oauth.dto");
const token_exchange_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/oauth/token-exchange.dto");
const register_client_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/oauth/register-client.dto");
const hubspot_install_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/oauth/hubspot-install.dto");
const oauth_types_1 = require("../../../../../libraries/nestjs-libraries/src/chat/oauth-types");
const mcp_relay_service_1 = require("../../../../../libraries/nestjs-libraries/src/chat/mcp.relay.service");
const throttler_provider_1 = require("../../../../../libraries/nestjs-libraries/src/throttler/throttler.provider");
let OAuthController = class OAuthController {
    constructor(_oauthService, _mcpRelayService) {
        this._oauthService = _oauthService;
        this._mcpRelayService = _mcpRelayService;
    }
    async register(body) {
        return this._oauthService.registerDynamicClient(body);
    }
    async authorize(query) {
        const app = await this._oauthService.validateAuthorizationRequest(query.client_id, {
            redirectUri: query.redirect_uri,
            codeChallenge: query.code_challenge,
            codeChallengeMethod: query.code_challenge_method,
        });
        const selfHosted = this._oauthService.allowsSelfHosted(app, query.resource);
        return {
            app: {
                name: app.name,
                description: app.description,
                picture: app.picture,
                clientId: app.clientId,
                redirectUrl: app.redirectUrl,
            },
            state: query.state,
            selfHosted,
            selfHostedEmail: selfHosted && this._oauthService.selfHostedRequiresEmail(app),
        };
    }
    async authorizeSelfHosted(body) {
        const app = await this._oauthService.validateAuthorizationRequest(body.client_id, {
            redirectUri: body.redirect_uri,
            codeChallenge: body.code_challenge,
            codeChallengeMethod: body.code_challenge_method,
        });
        const email = body.email?.trim();
        this._oauthService.validateSelfHostedRequest(app, {
            resource: body.resource,
            email,
        });
        const instance = await this._mcpRelayService.connect(body.instance_url, body.api_key);
        const code = await this._oauthService.createSelfHostedAuthorizationCode(app.id, { ...instance, email }, this._oauthService.pkceBinding(app, {
            codeChallenge: body.code_challenge,
            codeChallengeMethod: body.code_challenge_method,
            redirectUri: body.redirect_uri,
        }));
        const redirectUrl = new URL(app.dynamic ? body.redirect_uri : app.redirectUrl);
        redirectUrl.searchParams.set('code', code);
        if (body.state) {
            redirectUrl.searchParams.set('state', body.state);
        }
        return { redirect: redirectUrl.toString() };
    }
    async token(body, authorization) {
        const basic = (0, oauth_types_1.extractBasicCredentials)(authorization);
        const clientId = basic?.clientId || body.client_id;
        if (body.grant_type === 'refresh_token') {
            return this._oauthService.refreshAccessToken(clientId, body.refresh_token);
        }
        if (body.grant_type !== 'authorization_code') {
            throw new common_1.HttpException({ error: 'unsupported_grant_type' }, common_1.HttpStatus.BAD_REQUEST);
        }
        if (!clientId) {
            throw new common_1.HttpException({ error: 'invalid_client' }, common_1.HttpStatus.UNAUTHORIZED);
        }
        return this._oauthService.exchangeCodeForToken(body.code, clientId, basic?.clientSecret || body.client_secret, body.code_verifier, body.redirect_uri);
    }
    async userinfo(authorization) {
        return this._oauthService.getUserInfo(authorization);
    }
    async userinfoPost(authorization) {
        return this._oauthService.getUserInfo(authorization);
    }
    async hubspotCallback(query, response) {
        await this._oauthService.completeHubspotInstall(query.code);
        const installed = `${process.env.FRONTEND_URL}/launches?hubspot=installed`;
        return response.redirect(302, `${installed}&returnUrl=${encodeURIComponent(installed)}`);
    }
};
exports.OAuthController = OAuthController;
__decorate([
    (0, common_1.Post)('/register'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_client_dto_1.RegisterClientDto]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('/authorize'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authorize_oauth_dto_1.AuthorizeOAuthQueryDto]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "authorize", null);
__decorate([
    (0, common_1.UseGuards)(throttler_provider_1.ThrottlerRealIpGuard),
    (0, throttler_1.Throttle)({ default: { limit: 30, ttl: 3600000 } }),
    (0, common_1.Post)('/authorize/self-hosted'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authorize_oauth_dto_1.AuthorizeSelfHostedDto]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "authorizeSelfHosted", null);
__decorate([
    (0, common_1.Post)('/token'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [token_exchange_dto_1.TokenExchangeDto, String]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "token", null);
__decorate([
    (0, common_1.Get)('/userinfo'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "userinfo", null);
__decorate([
    (0, common_1.Post)('/userinfo'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "userinfoPost", null);
__decorate([
    (0, common_1.UseGuards)(throttler_provider_1.ThrottlerRealIpGuard),
    (0, throttler_1.Throttle)({ default: { limit: 30, ttl: 3600000 } }),
    (0, common_1.Get)('/hubspot/callback'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)({ passthrough: false })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hubspot_install_dto_1.HubspotInstallQueryDto, Object]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "hubspotCallback", null);
exports.OAuthController = OAuthController = __decorate([
    (0, swagger_1.ApiTags)('OAuth'),
    (0, common_1.Controller)('/oauth'),
    __metadata("design:paramtypes", [oauth_service_1.OAuthService,
        mcp_relay_service_1.McpRelayService])
], OAuthController);
let OAuthAuthorizedController = class OAuthAuthorizedController {
    constructor(_oauthService) {
        this._oauthService = _oauthService;
    }
    async approveOrDeny(body, user, org) {
        const app = await this._oauthService.validateAuthorizationRequest(body.client_id, {
            redirectUri: body.redirect_uri,
            codeChallenge: body.code_challenge,
            codeChallengeMethod: body.code_challenge_method,
        });
        const redirectTarget = app.dynamic ? body.redirect_uri : app.redirectUrl;
        if (body.action === 'deny') {
            const redirectUrl = new URL(redirectTarget);
            redirectUrl.searchParams.set('error', 'access_denied');
            if (body.state) {
                redirectUrl.searchParams.set('state', body.state);
            }
            return { redirect: redirectUrl.toString() };
        }
        const code = await this._oauthService.createAuthorizationCode(app.id, user.id, org.id, this._oauthService.pkceBinding(app, {
            codeChallenge: body.code_challenge,
            codeChallengeMethod: body.code_challenge_method,
            redirectUri: body.redirect_uri,
        }));
        const redirectUrl = new URL(redirectTarget);
        redirectUrl.searchParams.set('code', code);
        if (body.state) {
            redirectUrl.searchParams.set('state', body.state);
        }
        return { redirect: redirectUrl.toString() };
    }
};
exports.OAuthAuthorizedController = OAuthAuthorizedController;
__decorate([
    (0, common_1.Post)('/authorize'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_from_request_1.GetUserFromRequest)()),
    __param(2, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authorize_oauth_dto_1.ApproveOAuthDto, Object, Object]),
    __metadata("design:returntype", Promise)
], OAuthAuthorizedController.prototype, "approveOrDeny", null);
exports.OAuthAuthorizedController = OAuthAuthorizedController = __decorate([
    (0, swagger_1.ApiTags)('OAuth'),
    (0, common_1.Controller)('/oauth'),
    __metadata("design:paramtypes", [oauth_service_1.OAuthService])
], OAuthAuthorizedController);
//# sourceMappingURL=oauth.controller.js.map