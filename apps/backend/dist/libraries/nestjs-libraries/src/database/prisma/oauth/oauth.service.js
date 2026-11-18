"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthService = exports.selfHostedRelayEnabled = exports.hubspotInstallUrl = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const oauth_repository_1 = require("@gitroom/nestjs-libraries/database/prisma/oauth/oauth.repository");
const make_secure_id_1 = require("@gitroom/nestjs-libraries/services/make.secure.id");
const auth_service_1 = require("@gitroom/helpers/auth/auth.service");
const oauth_types_1 = require("@gitroom/nestjs-libraries/chat/oauth-types");
const crypto_1 = require("crypto");
const openAiOAuthClientId = () => process.env.OPENAI_OAUTH_CLIENT_ID?.trim();
const enableOidcEmailClaims = () => Boolean(openAiOAuthClientId());
const hubspotOAuthClientId = () => process.env.HUBSPOT_OAUTH_CLIENT_ID?.trim();
const hubspotTokenExpiresIn = 10 * 365 * 24 * 60 * 60;
const hubspotAppClientId = () => process.env.HUBSPOT_APP_CLIENT_ID?.trim();
const hubspotAppClientSecret = () => process.env.HUBSPOT_APP_CLIENT_SECRET?.trim();
const hubspotInstallRedirectUri = () => `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth/hubspot/callback`;
const hubspotInstallUrl = () => {
    const clientId = hubspotAppClientId();
    if (!clientId || !hubspotAppClientSecret()) {
        return undefined;
    }
    const url = new URL('https://app.hubspot.com/oauth/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', hubspotInstallRedirectUri());
    url.searchParams.set('scope', 'oauth');
    return url.toString();
};
exports.hubspotInstallUrl = hubspotInstallUrl;
const selfHostedRelayEnabled = () => process.env.MCP_SELF_HOSTED_RELAY === 'true';
exports.selfHostedRelayEnabled = selfHostedRelayEnabled;
const isVerifiedHost = (host, verifiedDomains) => verifiedDomains.some((domain) => host === domain || host.endsWith('.' + domain));
const browserSchemes = [
    'javascript:',
    'data:',
    'blob:',
    'file:',
    'vbscript:',
    'about:',
];
let OAuthService = class OAuthService {
    constructor(_oauthRepository) {
        this._oauthRepository = _oauthRepository;
    }
    async getApp(orgId) {
        const app = await this._oauthRepository.getAppByOrgId(orgId);
        if (!app)
            return false;
        const { clientSecret, ...rest } = app;
        return rest;
    }
    async createApp(orgId, dto) {
        const existing = await this._oauthRepository.getAppByOrgId(orgId);
        if (existing) {
            throw new common_1.HttpException('You can only have one OAuth application per organization', common_1.HttpStatus.BAD_REQUEST);
        }
        const clientId = 'pca_' + (0, make_secure_id_1.makeSecureId)(32);
        const clientSecret = 'pcs_' + (0, make_secure_id_1.makeSecureId)(48);
        const encryptedSecret = auth_service_1.AuthService.fixedEncryption(clientSecret);
        const app = await this._oauthRepository.createApp(orgId, {
            name: dto.name,
            description: dto.description,
            pictureId: dto.pictureId,
            redirectUrl: dto.redirectUrl,
            clientId,
            clientSecret: encryptedSecret,
        });
        return { ...app, clientSecret };
    }
    async updateApp(orgId, dto) {
        return this._oauthRepository.updateApp(orgId, {
            ...(dto.name && { name: dto.name }),
            ...(dto.description !== undefined && { description: dto.description }),
            ...(dto.pictureId !== undefined && { pictureId: dto.pictureId }),
            ...(dto.redirectUrl && { redirectUrl: dto.redirectUrl }),
        });
    }
    async deleteApp(orgId) {
        const app = await this._oauthRepository.getAppByOrgId(orgId);
        if (!app) {
            throw new common_1.HttpException('No OAuth app found', common_1.HttpStatus.NOT_FOUND);
        }
        await this._oauthRepository.revokeAllForApp(app.id);
        await this._oauthRepository.deleteApp(orgId);
        return { success: true };
    }
    async rotateSecret(orgId) {
        const app = await this._oauthRepository.getAppByOrgId(orgId);
        if (!app) {
            throw new common_1.HttpException('No OAuth app found', common_1.HttpStatus.NOT_FOUND);
        }
        const newSecret = 'pcs_' + (0, make_secure_id_1.makeSecureId)(48);
        const encrypted = auth_service_1.AuthService.fixedEncryption(newSecret);
        await this._oauthRepository.updateClientSecret(orgId, encrypted);
        return { clientSecret: newSecret };
    }
    verifiedDomainList() {
        return (process.env.DCR_VERIFIED_DOMAINS || '')
            .split(',')
            .map((domain) => domain.trim().toLowerCase())
            .filter(Boolean);
    }
    async registerDynamicClient(dto) {
        const redirectUris = dto.redirect_uris.map((uri) => uri.trim());
        const verifiedDomains = this.verifiedDomainList();
        for (const uri of redirectUris) {
            let parsed;
            try {
                parsed = new URL(uri);
            }
            catch {
                throw new common_1.HttpException({ error: 'invalid_redirect_uri', error_description: `Invalid redirect_uri: ${uri}` }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (browserSchemes.includes(parsed.protocol)) {
                throw new common_1.HttpException({ error: 'invalid_redirect_uri', error_description: `redirect_uri scheme "${parsed.protocol}" is not allowed` }, common_1.HttpStatus.BAD_REQUEST);
            }
            const isLoopback = parsed.protocol === 'http:' &&
                ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
            const isPrivateScheme = !['http:', 'https:'].includes(parsed.protocol);
            if (parsed.protocol === 'http:' && !isLoopback) {
                throw new common_1.HttpException({ error: 'invalid_redirect_uri', error_description: 'redirect_uris must use https or a private-use scheme (http is allowed for loopback only)' }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (isLoopback || isPrivateScheme || !verifiedDomains.length) {
                continue;
            }
            const host = parsed.hostname.toLowerCase();
            if (!isVerifiedHost(host, verifiedDomains)) {
                throw new common_1.HttpException({
                    error: 'invalid_redirect_uri',
                    error_description: `redirect_uri host "${host}" is not a verified domain`,
                }, common_1.HttpStatus.BAD_REQUEST);
            }
        }
        if (dto.grant_types?.length && !dto.grant_types.includes('authorization_code')) {
            throw new common_1.HttpException({ error: 'invalid_client_metadata', error_description: 'Only the authorization_code grant type is supported' }, common_1.HttpStatus.BAD_REQUEST);
        }
        this._oauthRepository
            .deleteStaleDynamicApps(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
            .catch(() => { });
        const isPublicClient = dto.token_endpoint_auth_method === 'none';
        const tokenEndpointAuthMethod = isPublicClient
            ? 'none'
            : dto.token_endpoint_auth_method === 'client_secret_basic'
                ? 'client_secret_basic'
                : 'client_secret_post';
        const clientId = 'pcd_' + (0, make_secure_id_1.makeSecureId)(32);
        const clientSecret = isPublicClient ? undefined : 'pcs_' + (0, make_secure_id_1.makeSecureId)(48);
        const app = await this._oauthRepository.createDynamicApp({
            name: dto.client_name?.trim().slice(0, 100) || 'MCP Client',
            redirectUrl: redirectUris[0],
            redirectUris: JSON.stringify(redirectUris),
            clientId,
            clientSecret: clientSecret && auth_service_1.AuthService.fixedEncryption(clientSecret),
            tokenEndpointAuthMethod,
        });
        return {
            client_id: clientId,
            ...(clientSecret ? { client_secret: clientSecret, client_secret_expires_at: 0 } : {}),
            client_id_issued_at: Math.floor(app.createdAt.getTime() / 1000),
            client_name: app.name,
            redirect_uris: redirectUris,
            token_endpoint_auth_method: tokenEndpointAuthMethod,
            grant_types: ['authorization_code'],
            response_types: ['code'],
            scope: 'mcp:read mcp:write',
        };
    }
    allowsEmailClaims(app) {
        if (!enableOidcEmailClaims()) {
            return false;
        }
        if (app.clientId === openAiOAuthClientId()) {
            return true;
        }
        if (!app.dynamic) {
            return false;
        }
        const verifiedDomains = this.verifiedDomainList();
        if (!verifiedDomains.length) {
            return false;
        }
        const webHosts = [];
        for (const uri of JSON.parse(app.redirectUris || '[]')) {
            try {
                const parsed = new URL(uri);
                if (parsed.protocol === 'https:') {
                    webHosts.push(parsed.hostname.toLowerCase());
                }
            }
            catch {
                return false;
            }
        }
        return (webHosts.length > 0 &&
            webHosts.every((host) => isVerifiedHost(host, verifiedDomains)));
    }
    grantedScope(app) {
        return [
            ...(this.allowsEmailClaims(app) ? ['openid', 'email'] : []),
            'mcp:read',
            'mcp:write',
        ].join(' ');
    }
    allowsSelfHosted(app, resource) {
        if (!(0, exports.selfHostedRelayEnabled)()) {
            return false;
        }
        if (app.dynamic || app.clientId === openAiOAuthClientId()) {
            return true;
        }
        try {
            return !!resource && new URL(resource).pathname.startsWith('/mcp-oauth');
        }
        catch {
            return false;
        }
    }
    selfHostedRequiresEmail(app) {
        return enableOidcEmailClaims() && app.clientId === openAiOAuthClientId();
    }
    validateSelfHostedRequest(app, options) {
        if (!this.allowsSelfHosted(app, options.resource)) {
            throw new common_1.HttpException('This application can not connect to a self-hosted instance', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!options.email && this.selfHostedRequiresEmail(app)) {
            throw new common_1.HttpException('Enter your email address', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async validateAuthorizationRequest(clientId, options) {
        const app = await this._oauthRepository.getAppByClientId(clientId);
        if (!app) {
            throw new common_1.HttpException('Invalid client_id', common_1.HttpStatus.BAD_REQUEST);
        }
        if (app.dynamic) {
            const registered = JSON.parse(app.redirectUris || '[]');
            if (!options?.redirectUri || !registered.includes(options.redirectUri)) {
                throw new common_1.HttpException('Invalid redirect_uri', common_1.HttpStatus.BAD_REQUEST);
            }
        }
        const isPublicClient = this.isPublicClient(app);
        if (app.dynamic || isPublicClient) {
            if (isPublicClient && !options?.codeChallenge) {
                throw new common_1.HttpException('code_challenge is required for this client', common_1.HttpStatus.BAD_REQUEST);
            }
            if (options?.codeChallenge &&
                options?.codeChallengeMethod &&
                options.codeChallengeMethod !== 'S256') {
                throw new common_1.HttpException('Only the S256 code_challenge_method is supported', common_1.HttpStatus.BAD_REQUEST);
            }
        }
        return app;
    }
    isPublicClient(app) {
        return ((app.dynamic && app.tokenEndpointAuthMethod === 'none') ||
            app.clientId === hubspotOAuthClientId());
    }
    pkceBinding(app, request) {
        if (app.dynamic) {
            return request;
        }
        if (this.isPublicClient(app)) {
            return {
                codeChallenge: request.codeChallenge,
                codeChallengeMethod: request.codeChallengeMethod,
            };
        }
        return undefined;
    }
    async createAuthorizationCode(oauthAppId, userId, organizationId, pkce) {
        const code = (0, make_secure_id_1.makeSecureId)(32);
        const encryptedCode = auth_service_1.AuthService.fixedEncryption(code);
        const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this._oauthRepository.createAuthorization({
            oauthAppId,
            userId,
            organizationId,
            authorizationCode: encryptedCode,
            codeExpiresAt,
            codeChallenge: pkce?.codeChallenge,
            codeChallengeMethod: pkce?.codeChallengeMethod,
            redirectUri: pkce?.redirectUri,
        });
        return code;
    }
    async createSelfHostedAuthorizationCode(oauthAppId, instance, pkce) {
        this._oauthRepository
            .deleteAbandonedSelfHostedAuthorizations(new Date(Date.now() - 24 * 60 * 60 * 1000))
            .catch(() => { });
        const code = 'psc_' + (0, make_secure_id_1.makeSecureId)(32);
        await this._oauthRepository.createSelfHostedAuthorization({
            oauthAppId,
            mcpUrl: instance.mcpUrl,
            apiKey: auth_service_1.AuthService.fixedEncryption(instance.apiKey),
            email: instance.email,
            authorizationCode: auth_service_1.AuthService.fixedEncryption(code),
            codeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
            codeChallenge: pkce?.codeChallenge,
            codeChallengeMethod: pkce?.codeChallengeMethod,
            redirectUri: pkce?.redirectUri,
        });
        return code;
    }
    async exchangeCodeForToken(code, clientId, clientSecret, codeVerifier, redirectUri) {
        const app = await this._oauthRepository.getAppByClientId(clientId);
        if (!app) {
            throw new common_1.HttpException({ error: 'invalid_client' }, common_1.HttpStatus.UNAUTHORIZED);
        }
        if (!this.isPublicClient(app)) {
            if (!clientSecret ||
                !app.clientSecret ||
                app.clientSecret !== auth_service_1.AuthService.fixedEncryption(clientSecret)) {
                throw new common_1.HttpException({ error: 'invalid_client' }, common_1.HttpStatus.UNAUTHORIZED);
            }
        }
        if (code.startsWith('psc_')) {
            return this.exchangeSelfHostedCodeForToken(app, code, codeVerifier, redirectUri);
        }
        const encryptedCode = auth_service_1.AuthService.fixedEncryption(code);
        const auth = await this._oauthRepository.findByCode(encryptedCode);
        if (!auth || auth.oauthAppId !== app.id) {
            throw new common_1.HttpException({ error: 'invalid_grant' }, common_1.HttpStatus.BAD_REQUEST);
        }
        this.verifyCodeGrant(auth, codeVerifier, redirectUri);
        const token = 'pos_' + (0, make_secure_id_1.makeSecureId)(40);
        const encryptedToken = auth_service_1.AuthService.fixedEncryption(token);
        const { organizationId, organization: { paymentId }, } = await this._oauthRepository.exchangeCodeForToken(auth.id, encryptedToken);
        return {
            id: organizationId,
            cus: paymentId,
            access_token: token,
            token_type: 'bearer',
            scope: this.grantedScope(app),
            ...this.refreshFields(app, token),
        };
    }
    verifyCodeGrant(auth, codeVerifier, redirectUri) {
        if (!auth.codeExpiresAt || new Date() > auth.codeExpiresAt) {
            throw new common_1.HttpException({ error: 'invalid_grant', error_description: 'Code has expired' }, common_1.HttpStatus.BAD_REQUEST);
        }
        if (auth.codeChallenge) {
            if (!codeVerifier) {
                throw new common_1.HttpException({ error: 'invalid_grant', error_description: 'code_verifier is required' }, common_1.HttpStatus.BAD_REQUEST);
            }
            const hashed = (0, crypto_1.createHash)('sha256').update(codeVerifier).digest('base64url');
            if (hashed !== auth.codeChallenge) {
                throw new common_1.HttpException({ error: 'invalid_grant', error_description: 'Invalid code_verifier' }, common_1.HttpStatus.BAD_REQUEST);
            }
        }
        if (auth.redirectUri && redirectUri !== auth.redirectUri) {
            throw new common_1.HttpException({ error: 'invalid_grant', error_description: 'redirect_uri does not match the authorization request' }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async exchangeSelfHostedCodeForToken(app, code, codeVerifier, redirectUri) {
        const auth = await this._oauthRepository.findSelfHostedByCode(auth_service_1.AuthService.fixedEncryption(code));
        if (!auth || auth.oauthAppId !== app.id) {
            throw new common_1.HttpException({ error: 'invalid_grant' }, common_1.HttpStatus.BAD_REQUEST);
        }
        this.verifyCodeGrant(auth, codeVerifier, redirectUri);
        const token = 'psh_' + (0, make_secure_id_1.makeSecureId)(40);
        await this._oauthRepository.exchangeSelfHostedCodeForToken(auth.id, auth_service_1.AuthService.fixedEncryption(token));
        return {
            access_token: token,
            token_type: 'bearer',
            scope: this.grantedScope(app),
            ...this.refreshFields(app, token),
        };
    }
    refreshFields(app, token) {
        if (app.clientId !== hubspotOAuthClientId()) {
            return {};
        }
        return {
            refresh_token: token,
            expires_in: hubspotTokenExpiresIn,
        };
    }
    async refreshAccessToken(clientId, refreshToken) {
        if (!clientId || clientId !== hubspotOAuthClientId()) {
            throw new common_1.HttpException({ error: 'unsupported_grant_type' }, common_1.HttpStatus.BAD_REQUEST);
        }
        const app = await this._oauthRepository.getAppByClientId(clientId);
        if (!app) {
            throw new common_1.HttpException({ error: 'invalid_client' }, common_1.HttpStatus.UNAUTHORIZED);
        }
        if (!refreshToken) {
            throw new common_1.HttpException({ error: 'invalid_request', error_description: 'refresh_token is required' }, common_1.HttpStatus.BAD_REQUEST);
        }
        const encryptedToken = auth_service_1.AuthService.fixedEncryption(refreshToken);
        const authorization = refreshToken.startsWith('psh_')
            ? (0, exports.selfHostedRelayEnabled)()
                ? await this._oauthRepository.findSelfHostedByAccessToken(encryptedToken)
                : null
            : await this._oauthRepository.findByAccessToken(encryptedToken);
        if (!authorization || authorization.oauthAppId !== app.id) {
            throw new common_1.HttpException({ error: 'invalid_grant' }, common_1.HttpStatus.BAD_REQUEST);
        }
        return {
            access_token: refreshToken,
            token_type: 'bearer',
            scope: this.grantedScope(app),
            ...this.refreshFields(app, refreshToken),
        };
    }
    async completeHubspotInstall(code) {
        const clientId = hubspotAppClientId();
        const clientSecret = hubspotAppClientSecret();
        if (!clientId || !clientSecret) {
            throw new common_1.HttpException('Not found', common_1.HttpStatus.NOT_FOUND);
        }
        let response;
        try {
            response = await fetch('https://api.hubapi.com/oauth/v3/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: hubspotInstallRedirectUri(),
                    code,
                }),
                signal: AbortSignal.timeout(30000),
            });
        }
        catch (err) {
            throw new common_1.HttpException('Could not reach HubSpot to finish installing Nexora, please try again', common_1.HttpStatus.BAD_GATEWAY, { cause: err });
        }
        if (!response.ok) {
            const value = await response.json().catch(() => null);
            throw new common_1.HttpException(`Could not finish installing Nexora in HubSpot${value?.message ? `: ${value.message}` : ''}`, common_1.HttpStatus.BAD_REQUEST);
        }
        await response.body?.cancel();
    }
    async getSelfHostedByAccessToken(token) {
        if (!(0, exports.selfHostedRelayEnabled)()) {
            return null;
        }
        const authorization = await this._oauthRepository.findSelfHostedByAccessToken(auth_service_1.AuthService.fixedEncryption(token));
        if (!authorization) {
            return null;
        }
        return {
            id: authorization.id,
            mcpUrl: authorization.mcpUrl,
            apiKey: auth_service_1.AuthService.fixedDecryption(authorization.apiKey),
        };
    }
    deleteSelfHostedAuthorization(id) {
        return this._oauthRepository.deleteSelfHostedAuthorization(id);
    }
    async getOrgByOAuthToken(token) {
        const encrypted = auth_service_1.AuthService.fixedEncryption(token);
        return this._oauthRepository.findByAccessToken(encrypted);
    }
    async getUserInfo(authorization) {
        if (!enableOidcEmailClaims()) {
            throw new common_1.HttpException({
                error: 'not_found',
                error_description: 'OIDC email claims are not enabled',
            }, common_1.HttpStatus.NOT_FOUND);
        }
        const token = (0, oauth_types_1.extractBearerToken)(authorization);
        if (!token) {
            throw new common_1.HttpException({ error: 'invalid_token', error_description: 'Bearer token required' }, common_1.HttpStatus.UNAUTHORIZED);
        }
        if (token.startsWith('psh_')) {
            return this.getSelfHostedUserInfo(token);
        }
        const authorizationRecord = await this.getOrgByOAuthToken(token);
        if (!authorizationRecord) {
            throw new common_1.HttpException({ error: 'invalid_token', error_description: 'Token is invalid or revoked' }, common_1.HttpStatus.UNAUTHORIZED);
        }
        if (!this.allowsEmailClaims(authorizationRecord.oauthApp)) {
            throw new common_1.HttpException({
                error: 'insufficient_scope',
                error_description: 'This OAuth client is not authorized to access email claims',
            }, common_1.HttpStatus.FORBIDDEN);
        }
        const { user } = authorizationRecord;
        return {
            sub: user.id,
            email: user.email,
            email_verified: user.activated,
        };
    }
    async getSelfHostedUserInfo(token) {
        const selfHosted = (0, exports.selfHostedRelayEnabled)()
            ? await this._oauthRepository.findSelfHostedUserInfo(auth_service_1.AuthService.fixedEncryption(token))
            : null;
        if (!selfHosted) {
            throw new common_1.HttpException({ error: 'invalid_token', error_description: 'Token is invalid or revoked' }, common_1.HttpStatus.UNAUTHORIZED);
        }
        if (!this.allowsEmailClaims(selfHosted.oauthApp)) {
            throw new common_1.HttpException({
                error: 'insufficient_scope',
                error_description: 'This OAuth client is not authorized to access email claims',
            }, common_1.HttpStatus.FORBIDDEN);
        }
        return {
            sub: selfHosted.id,
            ...(selfHosted.email
                ? { email: selfHosted.email, email_verified: false }
                : {}),
        };
    }
    async getApprovedApps(userId) {
        return this._oauthRepository.getApprovedApps(userId);
    }
    async revokeApp(userId, authId) {
        await this._oauthRepository.revokeAuthorization(userId, authId);
        return { success: true };
    }
};
exports.OAuthService = OAuthService;
exports.OAuthService = OAuthService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [oauth_repository_1.OAuthRepository])
], OAuthService);
//# sourceMappingURL=oauth.service.js.map