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
exports.IntegrationSchedulePostTool = void 0;
const tools_1 = require("@mastra/core/tools");
const zod_1 = require("zod");
const common_1 = require("@nestjs/common");
const integration_service_1 = require("../../database/prisma/integrations/integration.service");
const posts_service_1 = require("../../database/prisma/posts/posts.service");
const make_is_1 = require("../../services/make.is");
const auth_context_1 = require("../auth.context");
const valid_url_path_1 = require("../../../../helpers/src/utils/valid.url.path");
const validUrlExtension = new valid_url_path_1.ValidUrlExtension();
const validUrlPath = new valid_url_path_1.ValidUrlPath();
const attachmentUrl = zod_1.z
    .string()
    .refine((url) => validUrlPath.validate(url, {}), {
    message: validUrlPath.defaultMessage({}),
})
    .refine((url) => validUrlExtension.validate(url, {}), {
    message: validUrlExtension.defaultMessage({}),
});
const attachment = zod_1.z.union([
    attachmentUrl,
    zod_1.z.object({
        path: attachmentUrl,
        alt: zod_1.z.string().optional(),
        thumbnail: attachmentUrl.optional(),
        thumbnailTimestamp: zod_1.z.number().int().min(0).optional(),
    }),
]);
const toMedia = (a) => typeof a === 'string'
    ? { path: a }
    : {
        path: a.path,
        alt: a.alt,
        thumbnail: a.thumbnail,
        thumbnailTimestamp: a.thumbnailTimestamp,
    };
let IntegrationSchedulePostTool = class IntegrationSchedulePostTool {
    constructor(_postsService, _integrationService) {
        this._postsService = _postsService;
        this._integrationService = _integrationService;
        this.name = 'integrationSchedulePostTool';
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'schedulePostTool',
            mcp: {
                annotations: {
                    title: 'Schedule Social Media Post',
                    readOnlyHint: false,
                    destructiveHint: true,
                    idempotentHint: false,
                    openWorldHint: true,
                },
            },
            description: `
Use this when the user wants to create a draft, scheduled, or immediate social media post on their connected channels, based on the integrationSchema tool.
Examples of the input shape:

A single LinkedIn post with one comment
- socialPost array length will be one
- postsAndComments array length will be two (one for the post, one for the comment)

20 Facebook posts each on individual days without comments
- socialPost array length will be 20
- postsAndComments array length will be one

Do not use this to update or delete existing posts.
On success, each item in output contains a previewUrl the user can open to see the post.
If validation fails, the result contains output.errors describing what to fix; the call can be retried with corrected parameters.
`,
            inputSchema: zod_1.z.object({
                socialPost: zod_1.z
                    .array(zod_1.z.object({
                    integrationId: zod_1.z
                        .string()
                        .describe('The id of the integration (not internal id)'),
                    isPremium: zod_1.z
                        .boolean()
                        .describe("If the integration is X, return if it's premium or not"),
                    date: zod_1.z.string().describe('The date of the post in UTC time'),
                    shortLink: zod_1.z
                        .boolean()
                        .describe('If the post has a link inside, we can ask the user if they want to add a short link'),
                    type: zod_1.z
                        .enum(['draft', 'schedule', 'now'])
                        .describe('The type of the post, if we pass now, we should pass the current date also'),
                    postsAndComments: zod_1.z
                        .array(zod_1.z.object({
                        content: zod_1.z
                            .string()
                            .describe("The content of the post, HTML, Each line must be wrapped in <p> here is the possible tags: h1, h2, h3, u, strong, li, ul, p (you can't have u and strong together), img (<img src=\"...\">) only when the integration rules say pictures go inside the content, and span only for a mention in the exact format given by a mention tool from the integrationSchema tools"),
                        attachments: zod_1.z
                            .array(attachment)
                            .describe('The media of the post: either an uploaded media URL string, or { path, alt?, thumbnail?, thumbnailTimestamp? } where path is the uploaded media URL, alt is its alt text, thumbnail is the path of an uploaded jpeg/png (returned by uploadFromUrlTool) used as the video thumbnail / cover, and thumbnailTimestamp is the video frame to use as the cover, in milliseconds'),
                    }))
                        .describe('first item is the post, every other item is the comments'),
                    settings: zod_1.z
                        .array(zod_1.z.object({
                        key: zod_1.z
                            .string()
                            .describe('Name of the settings key to pass'),
                        value: zod_1.z
                            .any()
                            .describe('Value of the key, always prefer the id then label if possible. When the settings schema says a field is an id, pass the id returned by the channel tools, never the display label'),
                    }))
                        .describe('This relies on the integrationSchema tool to get the settings [input:settings]'),
                }))
                    .describe('Individual post'),
            }),
            outputSchema: zod_1.z.object({
                output: zod_1.z
                    .array(zod_1.z.object({
                    postId: zod_1.z.string(),
                    integration: zod_1.z.string(),
                    previewUrl: zod_1.z
                        .string()
                        .describe('Public preview page of the created post, share it with the user'),
                }))
                    .or(zod_1.z.object({ errors: zod_1.z.string() })),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                const organizationId = JSON.parse(context?.requestContext?.get('organization')).id;
                const finalOutput = [];
                const integrations = {};
                for (const platform of inputData.socialPost) {
                    integrations[platform.integrationId] =
                        await this._integrationService.getIntegrationById(organizationId, platform.integrationId);
                    const settings = platform.settings.reduce((acc, s) => ({
                        ...acc,
                        [s.key]: s.value,
                    }), {});
                    const [validation] = await this._postsService.validatePosts(organizationId, [
                        {
                            integration: { id: platform.integrationId },
                            settings,
                            value: platform.postsAndComments.map((p) => ({
                                content: p.content,
                                image: (p.attachments || []).map(toMedia),
                            })),
                        },
                    ]);
                    if (validation.emptyContent) {
                        return {
                            output: {
                                errors: `${validation.name}: Your post should have at least one character or one image.`,
                            },
                        };
                    }
                    if (platform.type !== 'draft') {
                        if (!validation.valid) {
                            return {
                                output: {
                                    errors: `${validation.name}: ${validation.settingsError || 'Please fix your settings'}, please fix it, and try integrationSchedulePostTool again.`,
                                },
                            };
                        }
                        if (validation.errors !== true) {
                            return {
                                output: {
                                    errors: `${validation.name}: ${validation.errors}, please fix it, and try integrationSchedulePostTool again.`,
                                },
                            };
                        }
                        if (validation.tooLong) {
                            return {
                                output: {
                                    errors: `${validation.name}: The maximum characters is ${validation.maximumCharacters}, please fix it, and try integrationSchedulePostTool again.`,
                                },
                            };
                        }
                    }
                }
                for (const post of inputData.socialPost) {
                    const integration = integrations[post.integrationId];
                    if (!integration) {
                        throw new Error('Integration not found');
                    }
                    const output = await this._postsService.createPost(organizationId, {
                        date: post.date,
                        type: post.type,
                        shortLink: post.shortLink,
                        tags: [],
                        posts: [
                            {
                                integration,
                                group: (0, make_is_1.makeId)(10),
                                settings: post.settings.reduce((acc, s) => ({
                                    ...acc,
                                    [s.key]: s.value,
                                }), {
                                    __type: integration.providerIdentifier,
                                }),
                                value: post.postsAndComments.map((p) => ({
                                    content: p.content,
                                    id: (0, make_is_1.makeId)(10),
                                    delay: 0,
                                    image: p.attachments.map((a) => ({
                                        id: (0, make_is_1.makeId)(10),
                                        ...toMedia(a),
                                    })),
                                })),
                            },
                        ],
                    }, 'MCP');
                    finalOutput.push(...output.map((p) => ({
                        ...p,
                        previewUrl: `${process.env.FRONTEND_URL}/p/${p.postId}?share=true`,
                    })));
                }
                return {
                    output: finalOutput,
                };
            },
        });
    }
};
exports.IntegrationSchedulePostTool = IntegrationSchedulePostTool;
exports.IntegrationSchedulePostTool = IntegrationSchedulePostTool = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [posts_service_1.PostsService,
        integration_service_1.IntegrationService])
], IntegrationSchedulePostTool);
//# sourceMappingURL=integration.schedule.post.js.map