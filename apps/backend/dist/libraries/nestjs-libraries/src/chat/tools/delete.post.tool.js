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
exports.DeletePostTool = void 0;
const tools_1 = require("@mastra/core/tools");
const zod_1 = require("zod");
const common_1 = require("@nestjs/common");
const posts_service_1 = require("../../database/prisma/posts/posts.service");
const auth_context_1 = require("../auth.context");
let DeletePostTool = class DeletePostTool {
    constructor(_postsService) {
        this._postsService = _postsService;
        this.name = 'deletePostTool';
        this.optionalOnSelfHosted = true;
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'deletePostTool',
            mcp: {
                annotations: {
                    title: 'Delete Post',
                    readOnlyHint: false,
                    destructiveHint: true,
                    idempotentHint: true,
                    openWorldHint: false,
                },
            },
            description: `
Use this when the user wants to delete an existing post (scheduled, draft, published or errored).
Find the post first (list your posts) and pass its "id" here.
It deletes the post on that one channel together with its comments - a post created for several channels has a separate id on each channel.
A repeating post is listed once per repetition with the same id - deleting it deletes every repetition.
A deleted scheduled post is not published. Deleting a published post only removes it from Nexora - it stays live on the social network.
The deletion cannot be undone.
If the post cannot be deleted, the result contains output.errors explaining why.
`,
            inputSchema: zod_1.z.object({
                id: zod_1.z.string().describe('The "id" of the post to delete'),
            }),
            outputSchema: zod_1.z.object({
                output: zod_1.z
                    .object({
                    postId: zod_1.z.string(),
                })
                    .or(zod_1.z.object({ errors: zod_1.z.string() })),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                const organizationId = JSON.parse(context?.requestContext?.get('organization')).id;
                const [post] = await this._postsService.getPostsRecursively(inputData.id, false, organizationId, true);
                if (!post) {
                    return { output: { errors: 'Post not found' } };
                }
                if (post.parentPostId) {
                    return {
                        output: {
                            errors: 'This id belongs to a comment, pass the id of the main post',
                        },
                    };
                }
                await this._postsService.deletePost(organizationId, post.group);
                return { output: { postId: post.id } };
            },
        });
    }
};
exports.DeletePostTool = DeletePostTool;
exports.DeletePostTool = DeletePostTool = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [posts_service_1.PostsService])
], DeletePostTool);
//# sourceMappingURL=delete.post.tool.js.map