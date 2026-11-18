"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMcp = void 0;
const mastra_service_1 = require("@gitroom/nestjs-libraries/chat/mastra.service");
const load_tools_service_1 = require("@gitroom/nestjs-libraries/chat/load.tools.service");
const mcp_1 = require("@mastra/mcp");
const organization_service_1 = require("@gitroom/nestjs-libraries/database/prisma/organizations/organization.service");
const oauth_service_1 = require("@gitroom/nestjs-libraries/database/prisma/oauth/oauth.service");
const async_storage_1 = require("./async.storage");
const oauth_middleware_1 = require("./oauth-middleware");
const upload_widget_1 = require("@gitroom/nestjs-libraries/chat/ui/upload.widget");
const clipping_widget_1 = require("@gitroom/nestjs-libraries/chat/ui/clipping.widget");
const upload_factory_1 = require("@gitroom/nestjs-libraries/upload/upload.factory");
const mcp_relay_service_1 = require("@gitroom/nestjs-libraries/chat/mcp.relay.service");
const fixAcceptHeader = (req) => {
    const value = 'application/json, text/event-stream';
    req.headers.accept = value;
    const idx = req.rawHeaders.findIndex((h) => h.toLowerCase() === 'accept');
    if (idx !== -1) {
        req.rawHeaders[idx + 1] = value;
    }
    else {
        req.rawHeaders.push('Accept', value);
    }
};
const endListenStream = (req, res) => {
    if (req.headers['mcp-method'] !== 'subscriptions/listen') {
        return;
    }
    const timer = setTimeout(() => res.end(), 10000);
    res.on('close', () => clearTimeout(timer));
};
const openAiOAuthClientId = process.env.OPENAI_OAUTH_CLIENT_ID?.trim();
const enableOidcEmailClaims = Boolean(openAiOAuthClientId);
const hubspotOAuthClientId = process.env.HUBSPOT_OAUTH_CLIENT_ID?.trim();
const oauthScopes = [
    ...(enableOidcEmailClaims ? ['openid', 'email'] : []),
    'mcp:read',
    'mcp:write',
];
const startMcp = async (app) => {
    const mastraService = app.get(mastra_service_1.MastraService, { strict: false });
    const organizationService = app.get(organization_service_1.OrganizationService, { strict: false });
    const oauthService = app.get(oauth_service_1.OAuthService, { strict: false });
    const loadToolsService = app.get(load_tools_service_1.LoadToolsService, { strict: false });
    const mcpRelayService = app.get(mcp_relay_service_1.McpRelayService, { strict: false });
    const resolveAuth = async (token) => {
        if (token.startsWith('pos_')) {
            const authorization = await oauthService.getOrgByOAuthToken(token);
            if (!authorization)
                return null;
            return authorization.organization;
        }
        return organizationService.getOrgByApiKey(token);
    };
    const resolveSelfHosted = (token) => oauthService.getSelfHostedByAccessToken(token);
    const mastra = await mastraService.mastra();
    const agent = mastra.getAgent('Nexora');
    const agentTools = await agent.listTools();
    const tools = {
        ...agentTools,
        ...(await loadToolsService.loadTools(true)),
    };
    const claudeHiddenTools = [
        'generateImageTool',
        'generateVideoTool',
        'videoStatusTool',
        'generateVideoOptions',
        'videoFunctionTool',
        'clippingTool',
        'clippingStatusTool',
        'clippingWidgetTicketTool',
    ];
    const withoutClaudeHidden = (source) => Object.fromEntries(Object.entries(source).filter(([name]) => !claudeHiddenTools.includes(name)));
    const claudeTools = withoutClaudeHidden(tools);
    const backendUrl = process.env.NEXT_PUBLIC_OVERRIDE_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    let storageOrigin;
    try {
        storageOrigin = new URL(upload_factory_1.UploadFactory.createStorage().publicUrl('')).origin;
    }
    catch (err) { }
    const appResources = {
        [upload_widget_1.UPLOAD_WIDGET_URI]: {
            name: 'Upload Media',
            description: 'Upload an image or video from the device to the media library',
            html: (0, upload_widget_1.uploadWidgetHtml)(backendUrl),
            meta: {
                csp: { connectDomains: [new URL(backendUrl).origin] },
                permissions: { clipboardWrite: {} },
                prefersBorder: true,
            },
        },
        ...(upload_factory_1.UploadFactory.clippingEnabled()
            ? {
                [clipping_widget_1.CLIPPING_WIDGET_URI]: {
                    name: 'Video Clipping',
                    description: 'Progress of a video clipping and the clips it made',
                    html: (0, clipping_widget_1.clippingWidgetHtml)(backendUrl),
                    meta: {
                        csp: {
                            connectDomains: [new URL(backendUrl).origin],
                            ...(storageOrigin ? { resourceDomains: [storageOrigin] } : {}),
                        },
                        permissions: { clipboardWrite: {} },
                        prefersBorder: true,
                    },
                },
            }
            : {}),
    };
    const serverConfig = {
        name: 'Nexora MCP',
        version: '1.0.0',
        tools,
        agents: { Nexora: agent },
        appResources,
    };
    const server = new mcp_1.MCPServer({ ...serverConfig, protocolVersion: '2026-07-28' });
    const oauthServer = new mcp_1.MCPServer({
        name: 'Nexora MCP',
        version: '1.0.0',
        protocolVersion: '2026-07-28',
        tools,
        appResources,
    });
    const { [clipping_widget_1.CLIPPING_WIDGET_URI]: hiddenWidget, ...claudeAppResources } = appResources;
    const claudeOauthServer = new mcp_1.MCPServer({
        name: 'Nexora MCP',
        version: '1.0.0',
        protocolVersion: '2026-07-28',
        tools: claudeTools,
        appResources: claudeAppResources,
    });
    let selfHostedServer;
    let claudeSelfHostedServer;
    if ((0, oauth_service_1.selfHostedRelayEnabled)()) {
        const selfHostedTools = mcpRelayService.tools(agentTools);
        selfHostedServer = new mcp_1.MCPServer({
            name: 'Nexora MCP',
            version: '1.0.0',
            protocolVersion: '2026-07-28',
            tools: selfHostedTools,
        });
        claudeSelfHostedServer = new mcp_1.MCPServer({
            name: 'Nexora MCP',
            version: '1.0.0',
            protocolVersion: '2026-07-28',
            tools: withoutClaudeHidden(selfHostedTools),
        });
    }
    const authorizationServers = {
        '/mcp-oauth-chatgpt': {
            issuer: new URL('/mcp-oauth-chatgpt', process.env.NEXT_PUBLIC_BACKEND_URL).toString(),
            registration: false,
            refresh: false,
        },
        '/mcp-oauth-dynamic': {
            issuer: new URL('/mcp-oauth-dynamic', process.env.NEXT_PUBLIC_BACKEND_URL).toString(),
            registration: true,
            refresh: false,
        },
        ...(hubspotOAuthClientId
            ? {
                '/': {
                    issuer: new URL(process.env.NEXT_PUBLIC_BACKEND_URL).origin,
                    registration: false,
                    refresh: true,
                },
            }
            : {}),
    };
    const authorizationServerMetadata = (server) => ({
        issuer: server.issuer,
        authorization_endpoint: `${process.env.FRONTEND_URL}/oauth/authorize`,
        token_endpoint: `${backendUrl}/oauth/token`,
        ...(server.registration && {
            registration_endpoint: `${backendUrl}/oauth/register`,
        }),
        ...(enableOidcEmailClaims && {
            userinfo_endpoint: `${backendUrl}/oauth/userinfo`,
        }),
        response_types_supported: ['code'],
        grant_types_supported: server.refresh
            ? ['authorization_code', 'refresh_token']
            : ['authorization_code'],
        token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post', 'none'],
        code_challenge_methods_supported: ['S256'],
        scopes_supported: oauthScopes,
    });
    const createResourceMiddleware = (mcpPath, authorizationServer) => (0, oauth_middleware_1.createOAuthMiddleware)({
        oauth: {
            resource: new URL(mcpPath, process.env.NEXT_PUBLIC_BACKEND_URL).toString(),
            authorizationServers: [authorizationServers[authorizationServer].issuer],
            scopesSupported: oauthScopes,
            validateToken: async (token) => {
                const org = token.startsWith('psh_')
                    ? await resolveSelfHosted(token)
                    : await resolveAuth(token);
                if (!org) {
                    return { valid: false, error: 'invalid_token', errorDescription: 'Invalid API Key or OAuth token' };
                }
                return { valid: true, subject: token };
            },
        },
        mcpPath,
    });
    const oauthResources = {
        '/mcp-oauth-chatgpt': { middleware: createResourceMiddleware('/mcp-oauth-chatgpt', '/mcp-oauth-chatgpt'), mcpServer: oauthServer, selfHostedServer },
        '/mcp-oauth': { middleware: createResourceMiddleware('/mcp-oauth', '/mcp-oauth-dynamic'), mcpServer: oauthServer, selfHostedServer },
        '/mcp-oauth-claude': { middleware: createResourceMiddleware('/mcp-oauth-claude', '/mcp-oauth-dynamic'), mcpServer: claudeOauthServer, selfHostedServer: claudeSelfHostedServer },
        '/mcp-oauth-dynamic': { middleware: createResourceMiddleware('/mcp-oauth-dynamic', '/mcp-oauth-dynamic'), mcpServer: oauthServer, selfHostedServer },
    };
    if (process.env.OPENAI_APP_CHALLANGE) {
        app.use('/.well-known/openai-apps-challenge', (req, res) => {
            res.setHeader('Content-Type', 'text/plain');
            res.send(process.env.OPENAI_APP_CHALLANGE);
        });
    }
    const museChallenge = process.env.MUSE_CHALLENGE?.trim();
    if (museChallenge) {
        app.use('/.well-known/muse-challenge', (req, res, next) => {
            if (req.path !== `/${museChallenge}`) {
                next();
                return;
            }
            res.setHeader('Content-Type', 'text/plain');
            res.send(`muse-challenge=${museChallenge}`);
        });
    }
    app.use('/.well-known/oauth-protected-resource', async (req, res, next) => {
        const resource = oauthResources[req.path];
        if (!resource) {
            next();
            return;
        }
        const url = new URL('/.well-known/oauth-protected-resource', process.env.NEXT_PUBLIC_BACKEND_URL);
        await resource.middleware(req, res, url);
    });
    app.use('/.well-known/oauth-authorization-server', async (req, res, next) => {
        const server = authorizationServers[req.path];
        if (!server) {
            next();
            return;
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.writeHead(204);
            res.end();
            return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'max-age=3600');
        res.json(authorizationServerMetadata(server));
    });
    app.use('/.well-known/openid-configuration', async (req, res, next) => {
        const server = authorizationServers[req.path];
        if (!server || !enableOidcEmailClaims || req.path === '/') {
            next();
            return;
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.writeHead(204);
            res.end();
            return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'max-age=3600');
        res.json({
            ...authorizationServerMetadata(server),
            subject_types_supported: ['public'],
            claims_supported: ['sub', 'email', 'email_verified'],
        });
    });
    app.use(Object.keys(oauthResources), async (req, res, next) => {
        if (req.path !== '/' && req.path !== '') {
            next();
            return;
        }
        const { middleware, mcpServer, selfHostedServer } = oauthResources[req.baseUrl];
        const url = new URL(req.baseUrl, process.env.NEXT_PUBLIC_BACKEND_URL);
        const result = await middleware(req, res, url);
        if (!result.proceed)
            return;
        const token = result.tokenValidation?.subject;
        const selfHosted = token.startsWith('psh_');
        const relay = selfHosted ? await resolveSelfHosted(token) : undefined;
        const auth = selfHosted ? undefined : await resolveAuth(token);
        if (!auth && !(relay && selfHostedServer)) {
            res.status(401).json({ error: 'invalid_token', error_description: 'Could not resolve organization' });
            return;
        }
        endListenStream(req, res);
        fixAcceptHeader(req);
        await (0, async_storage_1.runWithContext)({ requestId: token, auth, relay: relay || undefined }, async () => {
            await (relay ? selfHostedServer : mcpServer).startHTTP({
                url: url,
                httpPath: url.pathname,
                options: {
                    serverless: true,
                },
                req,
                res,
            });
        });
    });
    app.use('/mcp', async (req, res, next) => {
        if (req.path !== '/' && req.path !== '') {
            next();
            return;
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Access-Control-Expose-Headers', '*');
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
            return;
        }
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            res.status(401).send('Missing Authorization header');
            return;
        }
        req.auth = await resolveAuth(token);
        if (!req.auth) {
            res.status(401).send('Invalid API Key or OAuth token');
            return;
        }
        const url = new URL('/mcp', process.env.NEXT_PUBLIC_BACKEND_URL);
        endListenStream(req, res);
        fixAcceptHeader(req);
        await (0, async_storage_1.runWithContext)({ requestId: token, auth: req.auth }, async () => {
            await server.startHTTP({
                url,
                httpPath: url.pathname,
                options: {
                    serverless: true,
                },
                req,
                res,
            });
        });
    });
    app.use('/mcp/:id', async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Access-Control-Expose-Headers', '*');
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
            return;
        }
        req.auth = await organizationService.getOrgByApiKey(req.params.id);
        if (!req.auth) {
            res.status(400).send('Invalid API Key');
            return;
        }
        const url = new URL(`/mcp/${req.params.id}`, process.env.NEXT_PUBLIC_BACKEND_URL);
        endListenStream(req, res);
        fixAcceptHeader(req);
        await (0, async_storage_1.runWithContext)({ requestId: req.params.id, auth: req.auth }, async () => {
            await server.startHTTP({
                url,
                httpPath: url.pathname,
                options: {
                    serverless: true,
                },
                req,
                res,
            });
        });
    });
    app.use(['/sse/:id', '/message/:id'], async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Access-Control-Expose-Headers', '*');
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
            return;
        }
        req.auth = await organizationService.getOrgByApiKey(req.params.id);
        if (!req.auth) {
            res.status(400).send('Invalid API Key');
            return;
        }
        const url = new URL(req.originalUrl, process.env.NEXT_PUBLIC_BACKEND_URL);
        await (0, async_storage_1.runWithContext)({ requestId: req.params.id, auth: req.auth }, async () => {
            await new mcp_1.MCPServer(serverConfig).startSSE({
                url,
                ssePath: `/sse/${req.params.id}`,
                messagePath: `/message/${req.params.id}`,
                req,
                res,
            });
        });
    });
};
exports.startMcp = startMcp;
//# sourceMappingURL=start.mcp.js.map