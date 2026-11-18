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
exports.OAuthRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let OAuthRepository = class OAuthRepository {
    constructor(_oauthApp, _oauthAuth, _oauthSelfHosted) {
        this._oauthApp = _oauthApp;
        this._oauthAuth = _oauthAuth;
        this._oauthSelfHosted = _oauthSelfHosted;
    }
    getAppByOrgId(orgId) {
        return this._oauthApp.model.oAuthApp.findFirst({
            where: {
                organizationId: orgId,
                deletedAt: null,
            },
            include: {
                picture: true,
            },
        });
    }
    getAppByClientId(clientId) {
        return this._oauthApp.model.oAuthApp.findFirst({
            where: {
                clientId,
                deletedAt: null,
            },
            include: {
                picture: true,
            },
        });
    }
    createApp(orgId, data) {
        return this._oauthApp.model.oAuthApp.create({
            data: {
                organizationId: orgId,
                name: data.name,
                description: data.description,
                pictureId: data.pictureId,
                redirectUrl: data.redirectUrl,
                clientId: data.clientId,
                clientSecret: data.clientSecret,
            },
            include: {
                picture: true,
            },
        });
    }
    createDynamicApp(data) {
        return this._oauthApp.model.oAuthApp.create({
            data: {
                name: data.name,
                redirectUrl: data.redirectUrl,
                redirectUris: data.redirectUris,
                clientId: data.clientId,
                clientSecret: data.clientSecret,
                tokenEndpointAuthMethod: data.tokenEndpointAuthMethod,
                dynamic: true,
            },
        });
    }
    deleteStaleDynamicApps(olderThan) {
        return this._oauthApp.model.oAuthApp.deleteMany({
            where: {
                dynamic: true,
                createdAt: { lt: olderThan },
                authorizations: { none: {} },
                selfHostedAuthorizations: { none: {} },
            },
        });
    }
    async updateApp(orgId, data) {
        const app = await this._oauthApp.model.oAuthApp.findFirst({
            where: {
                organizationId: orgId,
                deletedAt: null,
            },
        });
        if (!app) {
            return null;
        }
        return this._oauthApp.model.oAuthApp.update({
            where: { id: app.id },
            data,
            include: {
                picture: true,
            },
        });
    }
    async deleteApp(orgId) {
        const app = await this._oauthApp.model.oAuthApp.findFirst({
            where: {
                organizationId: orgId,
                deletedAt: null,
            },
        });
        if (!app) {
            return null;
        }
        return this._oauthApp.model.oAuthApp.update({
            where: { id: app.id },
            data: {
                deletedAt: new Date(),
            },
        });
    }
    async updateClientSecret(orgId, newSecret) {
        const app = await this._oauthApp.model.oAuthApp.findFirst({
            where: {
                organizationId: orgId,
                deletedAt: null,
            },
        });
        if (!app) {
            return null;
        }
        return this._oauthApp.model.oAuthApp.update({
            where: { id: app.id },
            data: {
                clientSecret: newSecret,
            },
        });
    }
    createAuthorization(data) {
        return this._oauthAuth.model.oAuthAuthorization.upsert({
            where: {
                oauthAppId_userId_organizationId: {
                    oauthAppId: data.oauthAppId,
                    userId: data.userId,
                    organizationId: data.organizationId,
                },
            },
            create: {
                oauthAppId: data.oauthAppId,
                userId: data.userId,
                organizationId: data.organizationId,
                authorizationCode: data.authorizationCode,
                codeExpiresAt: data.codeExpiresAt,
                codeChallenge: data.codeChallenge || null,
                codeChallengeMethod: data.codeChallengeMethod || null,
                redirectUri: data.redirectUri || null,
            },
            update: {
                authorizationCode: data.authorizationCode,
                codeExpiresAt: data.codeExpiresAt,
                codeChallenge: data.codeChallenge || null,
                codeChallengeMethod: data.codeChallengeMethod || null,
                redirectUri: data.redirectUri || null,
                accessToken: null,
                revokedAt: null,
            },
        });
    }
    findByCode(encryptedCode) {
        return this._oauthAuth.model.oAuthAuthorization.findFirst({
            where: {
                authorizationCode: encryptedCode,
                revokedAt: null,
            },
        });
    }
    exchangeCodeForToken(id, encryptedToken) {
        return this._oauthAuth.model.oAuthAuthorization.update({
            where: { id },
            select: {
                organizationId: true,
                organization: {
                    select: {
                        paymentId: true,
                    }
                }
            },
            data: {
                accessToken: encryptedToken,
                authorizationCode: null,
                codeExpiresAt: null,
                codeChallenge: null,
                codeChallengeMethod: null,
                redirectUri: null,
            },
        });
    }
    findByAccessToken(encryptedToken) {
        return this._oauthAuth.model.oAuthAuthorization.findFirst({
            where: {
                accessToken: encryptedToken,
                revokedAt: null,
            },
            include: {
                oauthApp: {
                    select: {
                        clientId: true,
                        dynamic: true,
                        redirectUris: true,
                    },
                },
                organization: {
                    include: {
                        subscription: {
                            select: {
                                subscriptionTier: true,
                                totalChannels: true,
                                isLifetime: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        activated: true,
                    },
                },
            },
        });
    }
    getApprovedApps(userId) {
        return this._oauthAuth.model.oAuthAuthorization.findMany({
            where: {
                userId,
                revokedAt: null,
                accessToken: { not: null },
            },
            include: {
                oauthApp: {
                    include: {
                        picture: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    revokeAuthorization(userId, authId) {
        return this._oauthAuth.model.oAuthAuthorization.update({
            where: {
                id: authId,
                userId,
            },
            data: {
                revokedAt: new Date(),
            },
        });
    }
    async revokeAllForApp(oauthAppId) {
        await this._oauthSelfHosted.model.oAuthSelfHostedAuthorization.updateMany({
            where: {
                oauthAppId,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
            },
        });
        return this._oauthAuth.model.oAuthAuthorization.updateMany({
            where: {
                oauthAppId,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
            },
        });
    }
    createSelfHostedAuthorization(data) {
        return this._oauthSelfHosted.model.oAuthSelfHostedAuthorization.create({
            select: {
                id: true,
            },
            data: {
                oauthAppId: data.oauthAppId,
                mcpUrl: data.mcpUrl,
                apiKey: data.apiKey,
                email: data.email || null,
                authorizationCode: data.authorizationCode,
                codeExpiresAt: data.codeExpiresAt,
                codeChallenge: data.codeChallenge || null,
                codeChallengeMethod: data.codeChallengeMethod || null,
                redirectUri: data.redirectUri || null,
            },
        });
    }
    deleteAbandonedSelfHostedAuthorizations(olderThan) {
        return this._oauthSelfHosted.model.oAuthSelfHostedAuthorization.deleteMany({
            where: {
                accessToken: null,
                createdAt: { lt: olderThan },
            },
        });
    }
    findSelfHostedByCode(encryptedCode) {
        return this._oauthSelfHosted.model.oAuthSelfHostedAuthorization.findFirst({
            where: {
                authorizationCode: encryptedCode,
                revokedAt: null,
            },
            select: {
                id: true,
                oauthAppId: true,
                codeExpiresAt: true,
                codeChallenge: true,
                redirectUri: true,
            },
        });
    }
    exchangeSelfHostedCodeForToken(id, encryptedToken) {
        return this._oauthSelfHosted.model.oAuthSelfHostedAuthorization.update({
            where: { id },
            select: {
                id: true,
            },
            data: {
                accessToken: encryptedToken,
                authorizationCode: null,
                codeExpiresAt: null,
                codeChallenge: null,
                codeChallengeMethod: null,
                redirectUri: null,
            },
        });
    }
    findSelfHostedByAccessToken(encryptedToken) {
        return this._oauthSelfHosted.model.oAuthSelfHostedAuthorization.findFirst({
            where: {
                accessToken: encryptedToken,
                revokedAt: null,
            },
            select: {
                id: true,
                oauthAppId: true,
                mcpUrl: true,
                apiKey: true,
            },
        });
    }
    findSelfHostedUserInfo(encryptedToken) {
        return this._oauthSelfHosted.model.oAuthSelfHostedAuthorization.findFirst({
            where: {
                accessToken: encryptedToken,
                revokedAt: null,
            },
            select: {
                id: true,
                email: true,
                oauthApp: {
                    select: {
                        clientId: true,
                        dynamic: true,
                        redirectUris: true,
                    },
                },
            },
        });
    }
    deleteSelfHostedAuthorization(id) {
        return this._oauthSelfHosted.model.oAuthSelfHostedAuthorization.deleteMany({
            where: { id },
        });
    }
};
exports.OAuthRepository = OAuthRepository;
exports.OAuthRepository = OAuthRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository])
], OAuthRepository);
//# sourceMappingURL=oauth.repository.js.map