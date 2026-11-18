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
exports.McpRelayService = void 0;
const common_1 = require("@nestjs/common");
const tools_1 = require("@mastra/core/tools");
const index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
const streamableHttp_js_1 = require("@modelcontextprotocol/sdk/client/streamableHttp.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const async_storage_1 = require("./async.storage");
const ssrf_safe_dispatcher_1 = require("../dtos/webhooks/ssrf.safe.dispatcher");
const webhook_url_validator_1 = require("../dtos/webhooks/webhook.url.validator");
const oauth_service_1 = require("../database/prisma/oauth/oauth.service");
const load_tools_service_1 = require("./load.tools.service");
const requiredTools = ['integrationList', 'integrationSchedulePostTool'];
const maxResponseBytes = 10 * 1024 * 1024;
const instanceFetch = async (url, init) => {
    const response = await fetch(url, {
        ...init,
        redirect: 'error',
        dispatcher: ssrf_safe_dispatcher_1.ssrfSafeDispatcher,
    });
    if (Number(response.headers.get('content-length')) > maxResponseBytes) {
        await response.body?.cancel();
        throw new Error('The response of the instance is too large');
    }
    if (!response.body) {
        return response;
    }
    let received = 0;
    const capped = response.body.pipeThrough(new TransformStream({
        transform(chunk, controller) {
            received += chunk.byteLength;
            if (received > maxResponseBytes) {
                controller.error(new Error('The response of the instance is too large'));
                return;
            }
            controller.enqueue(chunk);
        },
    }));
    return new Response(capped, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    });
};
let McpRelayService = class McpRelayService {
    constructor(_oauthService, _loadToolsService) {
        this._oauthService = _oauthService;
        this._loadToolsService = _loadToolsService;
    }
    async connect(instanceUrl, apiKey) {
        const value = instanceUrl.trim();
        let url;
        try {
            url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`);
        }
        catch {
            throw new common_1.HttpException('Enter the address of your Nexora instance, for example https://Nexora.example.com', common_1.HttpStatus.BAD_REQUEST);
        }
        if (url.username || url.password) {
            throw new common_1.HttpException('Enter the address of your Nexora instance, for example https://Nexora.example.com', common_1.HttpStatus.BAD_REQUEST);
        }
        const fromSettings = url.pathname.match(/^(.*?)\/mcp\/([^/]+)\/?$/);
        const key = apiKey?.trim() || (fromSettings && decodeURIComponent(fromSettings[2]));
        if (!key) {
            throw new common_1.HttpException('Enter the API key of your Nexora instance', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!(await (0, webhook_url_validator_1.isSafePublicHttpsUrl)(url.origin))) {
            throw new common_1.HttpException('Your Nexora instance must be reachable from the internet over https', common_1.HttpStatus.BAD_REQUEST);
        }
        const path = (fromSettings ? fromSettings[1] : url.pathname)
            .replace(/\/+$/, '')
            .replace(/\/mcp$/, '');
        const candidates = path.endsWith('/api')
            ? [`${url.origin}${path}/mcp`]
            : [`${url.origin}${path}/api/mcp`, `${url.origin}${path}/mcp`];
        for (const mcpUrl of candidates) {
            let tools;
            try {
                tools = await this.withClient({ mcpUrl, apiKey: key }, async (client) => (await client.listTools(undefined, { timeout: 10000 })).tools.map((tool) => tool.name));
            }
            catch (err) {
                if (err instanceof streamableHttp_js_1.StreamableHTTPError && err.code === 401) {
                    throw new common_1.HttpException('Your Nexora instance rejected this API key', common_1.HttpStatus.BAD_REQUEST);
                }
                if (err instanceof streamableHttp_js_1.StreamableHTTPError && err.code === 403) {
                    throw new common_1.HttpException('Your Nexora instance refused the connection (403), make sure nothing in front of it blocks requests from Nexora Cloud', common_1.HttpStatus.BAD_REQUEST);
                }
                continue;
            }
            if (!requiredTools.every((name) => tools.includes(name))) {
                throw new common_1.HttpException(`${url.origin} does not look like a Nexora instance, or it runs a version older than v2.19.0`, common_1.HttpStatus.BAD_REQUEST);
            }
            const missing = this._loadToolsService
                .coreToolNames()
                .filter((name) => !tools.includes(name));
            if (missing.length) {
                throw new common_1.HttpException(`Your Nexora instance is missing tools this connection needs (${missing.join(', ')}). Update it to the latest Nexora version and connect again`, common_1.HttpStatus.BAD_REQUEST);
            }
            return { mcpUrl, apiKey: key };
        }
        throw new common_1.HttpException(`Could not find a Nexora MCP server at ${url.origin}. Paste the MCP URL from Settings > Agents / Dev (Agents, Developers or Public API on older versions) of your instance, and make sure it runs Nexora v2.19.0 or newer`, common_1.HttpStatus.BAD_REQUEST);
    }
    tools(source) {
        return Object.fromEntries(Object.entries(source).map(([name, tool]) => [
            name,
            (0, tools_1.createTool)({
                id: tool.id,
                description: tool.description,
                inputSchema: tool.inputSchema,
                outputSchema: tool.outputSchema,
                mcp: { annotations: tool.mcp?.annotations },
                execute: async (inputData, context) => {
                    const instance = (0, async_storage_1.getRelay)();
                    if (!instance) {
                        throw new Error('This connection is not linked to a self-hosted instance');
                    }
                    let result;
                    try {
                        result = await this.callTool(instance, name, inputData, context?.mcp?.extra?.signal);
                    }
                    catch (err) {
                        return this.failure(tool, err.message);
                    }
                    const text = this.text(result);
                    if (!tool.outputSchema) {
                        return text;
                    }
                    let output = result.structuredContent;
                    if (output === undefined) {
                        try {
                            output = JSON.parse(text);
                        }
                        catch {
                            return this.failure(tool, text ||
                                `${name} returned an unexpected answer from your Nexora instance`);
                        }
                    }
                    const check = await tool.outputSchema['~standard']?.validate(output);
                    if (check?.issues) {
                        return this.failure(tool, `Your Nexora instance answered ${name} in a format this connection does not know, update the instance to the latest Nexora version`);
                    }
                    return output;
                },
            }),
        ]));
    }
    async callTool(instance, name, args, signal) {
        let result;
        try {
            result = (await this.withClient(instance, (client) => client.callTool({ name, arguments: args }, undefined, {
                signal,
                timeout: 90000,
            })));
        }
        catch (err) {
            if (err instanceof streamableHttp_js_1.StreamableHTTPError && err.code === 401 && instance.id) {
                await this._oauthService.deleteSelfHostedAuthorization(instance.id);
            }
            throw new Error(this.describeError(instance, name, err));
        }
        if (result.isError) {
            const text = this.text(result);
            if (text.startsWith('Unknown tool:')) {
                throw new Error(`${name} is not available on your Nexora instance: the feature it needs is not set up there, or the instance needs an update to the latest Nexora version`);
            }
            if (text.startsWith('Tool validation failed')) {
                throw new Error(`Your Nexora instance runs an older version of ${name}, update it to the latest Nexora version to use it`);
            }
            throw new Error(text || `${name} failed on your Nexora instance`);
        }
        return result;
    }
    async withClient(instance, run) {
        const transport = new streamableHttp_js_1.StreamableHTTPClientTransport(new URL(instance.mcpUrl), {
            requestInit: {
                headers: { Authorization: `Bearer ${instance.apiKey}` },
            },
            fetch: instanceFetch,
        });
        const client = new index_js_1.Client({ name: 'Nexora Cloud', version: '1.0.0' });
        try {
            await client.connect(transport, { timeout: 10000 });
            return await run(client);
        }
        finally {
            if (transport.sessionId) {
                await transport.terminateSession().catch(() => { });
            }
            await client.close().catch(() => { });
        }
    }
    async failure(tool, message) {
        if (!tool.outputSchema) {
            return message;
        }
        const check = await tool.outputSchema['~standard']?.validate({
            error: message,
        });
        if (check && !check.issues) {
            return { error: message };
        }
        throw new Error(message);
    }
    text(result) {
        return (result.content || [])
            .filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join('\n')
            .trim();
    }
    describeError(instance, name, err) {
        const origin = new URL(instance.mcpUrl).origin;
        if (err instanceof streamableHttp_js_1.StreamableHTTPError && err.code === 401) {
            return `Your Nexora instance (${origin}) rejected the saved API key, it was probably rotated, so this connection was removed. Connect Nexora again to keep using your instance`;
        }
        if (err instanceof streamableHttp_js_1.StreamableHTTPError && err.code === 403) {
            return `Your Nexora instance (${origin}) refused the request (403), make sure nothing in front of it blocks requests from Nexora Cloud`;
        }
        if (err instanceof types_js_1.McpError && err.code === types_js_1.ErrorCode.RequestTimeout) {
            return `Your Nexora instance (${origin}) did not answer ${name} in time`;
        }
        if (err instanceof types_js_1.McpError) {
            return `Your Nexora instance (${origin}) could not run ${name}: ${err.message}`;
        }
        return `Could not reach your Nexora instance (${origin}): ${err instanceof Error ? err.message : String(err)}. Make sure it is online and reachable from the internet`;
    }
};
exports.McpRelayService = McpRelayService;
exports.McpRelayService = McpRelayService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [oauth_service_1.OAuthService,
        load_tools_service_1.LoadToolsService])
], McpRelayService);
//# sourceMappingURL=mcp.relay.service.js.map