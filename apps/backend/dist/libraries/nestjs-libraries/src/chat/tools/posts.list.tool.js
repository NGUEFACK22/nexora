"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsListTool = void 0;
const tslib_1 = require("tslib");
const tools_1 = require("@mastra/core/tools");
const zod_1 = require("zod");
const common_1 = require("@nestjs/common");
const posts_service_1 = require("@gitroom/nestjs-libraries/database/prisma/posts/posts.service");
const auth_context_1 = require("@gitroom/nestjs-libraries/chat/auth.context");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const utc_1 = tslib_1.__importDefault(require("dayjs/plugin/utc"));
dayjs_1.default.extend(utc_1.default);
const parseSettings = (settings) => {
    try {
        return JSON.parse(settings || '{}');
    }
    catch (err) {
        return {};
    }
};
let PostsListTool = class PostsListTool {
    constructor(_postsService) {
        this._postsService = _postsService;
        this.name = 'postsListTool';
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'postsListTool',
            mcp: {
                annotations: {
                    title: 'List Posts',
                    readOnlyHint: true,
                    destructiveHint: false,
                    idempotentHint: true,
                    openWorldHint: false,
                },
            },
            description: `
List the organization's posts scheduled to be published between two dates (the same data as the "List Posts" API endpoint).
Returns every post in the window whatever its state (scheduled, draft, published, errored).
"startDate" and "endDate" are required (UTC) - to list all upcoming posts, pass a wide window (for example from now to a year ahead).
Each item has an "id", its publish date, state, error (for errored posts), content, channel and current provider settings.
`,
            inputSchema: zod_1.z.object({
                startDate: zod_1.z
                    .string()
                    .describe('Start of the window (UTC), for example 2026-07-20T00:00:00'),
                endDate: zod_1.z
                    .string()
                    .describe('End of the window (UTC), for example 2026-08-20T00:00:00'),
                customer: zod_1.z
                    .string()
                    .optional()
                    .describe('Optional customer (group) id to filter the channels by'),
            }),
            outputSchema: zod_1.z.object({
                output: zod_1.z.object({
                    posts: zod_1.z.array(zod_1.z.object({
                        id: zod_1.z
                            .string()
                            .describe('The post id'),
                        publishDate: zod_1.z.string().describe('UTC time'),
                        state: zod_1.z.string().describe('QUEUE, DRAFT, PUBLISHED or ERROR'),
                        error: zod_1.z
                            .string()
                            .nullable()
                            .describe('Curated failure message for errored posts, null otherwise'),
                        content: zod_1.z.string(),
                        settings: zod_1.z
                            .any()
                            .describe('The post current provider settings'),
                        group: zod_1.z.string(),
                        integrationId: zod_1.z.string(),
                        platform: zod_1.z.string(),
                        integrationName: zod_1.z.string(),
                    })),
                }),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                const organizationId = JSON.parse(context?.requestContext?.get('organization')).id;
                const posts = await this._postsService.getPosts(organizationId, {
                    startDate: inputData.startDate,
                    endDate: inputData.endDate,
                    customer: inputData.customer,
                });
                return {
                    output: {
                        posts: (posts || []).map((p) => ({
                            id: p.id,
                            publishDate: (0, dayjs_1.default)(p.publishDate)
                                .utc()
                                .format('YYYY-MM-DDTHH:mm:ss'),
                            state: p.state,
                            error: p.error ?? null,
                            content: p.content || '',
                            settings: parseSettings(p.settings),
                            group: p.group,
                            integrationId: p.integration?.id,
                            platform: p.integration?.providerIdentifier,
                            integrationName: p.integration?.name,
                        })),
                    },
                };
            },
        });
    }
};
exports.PostsListTool = PostsListTool;
exports.PostsListTool = PostsListTool = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [posts_service_1.PostsService])
], PostsListTool);
//# sourceMappingURL=posts.list.tool.js.map