"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostSettingsTool = void 0;
const tslib_1 = require("tslib");
const tools_1 = require("@mastra/core/tools");
const zod_1 = require("zod");
const common_1 = require("@nestjs/common");
const posts_service_1 = require("@gitroom/nestjs-libraries/database/prisma/posts/posts.service");
const auth_context_1 = require("@gitroom/nestjs-libraries/chat/auth.context");
let PostSettingsTool = class PostSettingsTool {
    constructor(_postsService) {
        this._postsService = _postsService;
        this.name = 'postSettingsTool';
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'postSettingsTool',
            mcp: {
                annotations: {
                    title: 'Update Post Settings',
                    readOnlyHint: false,
                    destructiveHint: true,
                    idempotentHint: false,
                    openWorldHint: false,
                },
            },
            description: `
Update the provider settings of an existing post (scheduled or draft) that was NOT published yet.
Only the settings change - the content and the publish date stay exactly as they are.
Find the post first (list your posts) and pass its "id" here.
The settings are merged into the existing ones, so only pass the keys you want to change; anything you don't pass stays as it is.
This relies on the integrationSchema tool [input:settings] to know which keys exist for the platform.
If validation fails, the result contains output.errors describing what to fix; the call can be retried with corrected parameters.
`,
            inputSchema: zod_1.z.object({
                id: zod_1.z
                    .string()
                    .describe('The "id" of the post to update its settings'),
                settings: zod_1.z
                    .array(zod_1.z.object({
                    key: zod_1.z.string().describe('Name of the settings key to change'),
                    value: zod_1.z
                        .any()
                        .describe('New value of the key, always prefer the id then label if possible. When the settings schema says a field is an id, pass the id returned by the channel tools, never the display label'),
                }))
                    .describe('Settings keys to change, merged into the existing settings. This relies on the integrationSchema tool [input:settings]'),
            }),
            outputSchema: zod_1.z.object({
                output: zod_1.z
                    .object({
                    postId: zod_1.z.string(),
                    publishDate: zod_1.z.string(),
                })
                    .or(zod_1.z.object({ errors: zod_1.z.string() })),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                const organizationId = JSON.parse(context?.requestContext?.get('organization')).id;
                const settings = (inputData.settings || []).reduce((acc, s) => ({
                    ...acc,
                    [s.key]: s.value,
                }), {});
                try {
                    const output = await this._postsService.updatePostSettings(organizationId, inputData.id, settings, 'MCP');
                    return { output };
                }
                catch (err) {
                    return {
                        output: {
                            errors: err?.message || 'Failed to update the post settings',
                        },
                    };
                }
            },
        });
    }
};
exports.PostSettingsTool = PostSettingsTool;
exports.PostSettingsTool = PostSettingsTool = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [posts_service_1.PostsService])
], PostSettingsTool);
//# sourceMappingURL=post.settings.tool.js.map