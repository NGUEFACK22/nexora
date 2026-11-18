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
exports.PostsController = void 0;
const common_1 = require("@nestjs/common");
const posts_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/posts/posts.service");
const org_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/org.from.request");
const get_posts_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/posts/get.posts.dto");
const get_posts_list_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/posts/get.posts.list.dto");
const permissions_ability_1 = require("../../services/auth/permissions/permissions.ability");
const swagger_1 = require("@nestjs/swagger");
const generator_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/generator/generator.dto");
const create_generated_posts_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/generator/create.generated.posts.dto");
const agent_graph_service_1 = require("../../../../../libraries/nestjs-libraries/src/agent/agent.graph.service");
const user_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/user.from.request");
const short_link_service_1 = require("../../../../../libraries/nestjs-libraries/src/short-linking/short.link.service");
const create_tag_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/posts/create.tag.dto");
const permission_exception_class_1 = require("../../services/auth/permissions/permission.exception.class");
const posts_validation_exception_1 = require("./posts.validation.exception");
const add_comment_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/comments/add.comment.dto");
const nestjs_real_ip_1 = require("nestjs-real-ip");
let PostsController = class PostsController {
    constructor(_postsService, _agentGraphService, _shortLinkService) {
        this._postsService = _postsService;
        this._agentGraphService = _agentGraphService;
        this._shortLinkService = _shortLinkService;
    }
    async getStatistics(org, id) {
        return this._postsService.getStatistics(org.id, id);
    }
    async getMissingContent(org, id) {
        return this._postsService.getMissingContent(org.id, id);
    }
    async getReleaseURL(org, id) {
        return this._postsService.getReleaseURL(org.id, id);
    }
    async updateReleaseId(org, id, releaseId) {
        return this._postsService.updateReleaseId(org.id, id, releaseId);
    }
    async shouldShortlink(body) {
        return { ask: this._shortLinkService.askShortLinkedin(body.messages) };
    }
    async createComment(user, id, body, ip) {
        return this._postsService.createPublicComment(id, body, user.id, ip);
    }
    async resolveComment(org, commentId, body) {
        return this._postsService.resolveComment(org.id, commentId, body.resolved);
    }
    async getTags(org) {
        return { tags: await this._postsService.getTags(org.id) };
    }
    async createTag(org, body) {
        return this._postsService.createTag(org.id, body);
    }
    async editTag(org, body, id) {
        return this._postsService.editTag(id, org.id, body);
    }
    async deleteTag(org, id) {
        return this._postsService.deleteTag(id, org.id);
    }
    async getPosts(org, query) {
        return this._postsService.getPostsMinified(org.id, query);
    }
    async findSlot(org) {
        return { date: await this._postsService.findFreeDateTime(org.id) };
    }
    async findSlotIntegration(org, id) {
        return { date: await this._postsService.findFreeDateTime(org.id, id) };
    }
    async getPostsList(org, query) {
        return this._postsService.getPostsList(org.id, query);
    }
    oldPosts(org, date) {
        return this._postsService.getOldPosts(org.id, date);
    }
    async getPostGroupDebugExport(org, user, group) {
        if (!user.isSuperAdmin) {
            throw new common_1.HttpException('Forbidden', 403);
        }
        return this._postsService.getPostGroupDebugExport(org.id, group);
    }
    getPostsByGroup(org, group) {
        return this._postsService.getPostsByGroup(org.id, group);
    }
    getPost(org, id) {
        return this._postsService.getPost(org.id, id);
    }
    async validatePosts(org, rawBody) {
        return this._postsService.validatePosts(org.id, rawBody?.posts || []);
    }
    async createPost(org, rawBody) {
        const validation = await this._postsService.validatePosts(org.id, rawBody?.posts || []);
        const fail = (item, error) => {
            throw new posts_validation_exception_1.PostValidationException({
                provider: item.identifier,
                name: item.name,
                error,
            });
        };
        for (const item of validation) {
            if (item.emptyContent) {
                fail(item, 'Your post should have at least one character or one image.');
            }
        }
        if (rawBody?.type !== 'draft') {
            for (const item of validation) {
                if (!item.valid) {
                    fail(item, item.settingsError || 'Please fix your settings');
                }
                if (item.errors !== true) {
                    fail(item, item.errors);
                }
                if (item.tooLong) {
                    fail(item, 'post is too long, please fix it');
                }
            }
        }
        const body = await this._postsService.mapTypeToPost(rawBody, org.id);
        return this._postsService.createPost(org.id, body, 'WEB');
    }
    generatePostsDraft(org, body) {
        return this._postsService.generatePostsDraft(org.id, body);
    }
    async generatePosts(org, body, res) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        try {
            for await (const event of this._agentGraphService.start(org.id, body)) {
                res.write(JSON.stringify(event) + '\n');
            }
        }
        catch (err) {
            const message = err instanceof common_1.HttpException
                ? err.message
                : 'Something went wrong while generating your posts, please try again.';
            res.write(JSON.stringify({ name: 'error', error: true, message }) + '\n');
        }
        res.end();
    }
    deletePost(org, group) {
        return this._postsService.deletePost(org.id, group);
    }
    changeDate(org, id, date, action = 'update') {
        return this._postsService.changeDate(org.id, id, date, action);
    }
    async separatePosts(org, body) {
        return this._postsService.separatePosts(body.content, body.len);
    }
};
exports.PostsController = PostsController;
__decorate([
    (0, common_1.Get)('/:id/statistics'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('/:id/missing'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getMissingContent", null);
__decorate([
    (0, common_1.Get)('/:id/release-url'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getReleaseURL", null);
__decorate([
    (0, common_1.Put)('/:id/release-id'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('releaseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "updateReleaseId", null);
__decorate([
    (0, common_1.Post)('/should-shortlink'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "shouldShortlink", null);
__decorate([
    (0, common_1.Post)('/:id/comments'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, nestjs_real_ip_1.RealIP)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, add_comment_dto_1.CreatePublicCommentDto, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "createComment", null);
__decorate([
    (0, common_1.Put)('/comments/:commentId/resolve'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('commentId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, add_comment_dto_1.ResolveCommentDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "resolveComment", null);
__decorate([
    (0, common_1.Get)('/tags'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getTags", null);
__decorate([
    (0, common_1.Post)('/tags'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_tag_dto_1.CreateTagDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "createTag", null);
__decorate([
    (0, common_1.Put)('/tags/:id'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_tag_dto_1.CreateTagDto, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "editTag", null);
__decorate([
    (0, common_1.Delete)('/tags/:id'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "deleteTag", null);
__decorate([
    (0, common_1.Get)('/'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_posts_dto_1.GetPostsDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getPosts", null);
__decorate([
    (0, common_1.Get)('/find-slot'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "findSlot", null);
__decorate([
    (0, common_1.Get)('/find-slot/:id'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "findSlotIntegration", null);
__decorate([
    (0, common_1.Get)('/list'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_posts_list_dto_1.GetPostsListDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getPostsList", null);
__decorate([
    (0, common_1.Get)('/old'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "oldPosts", null);
__decorate([
    (0, common_1.Get)('/group/:group/debug-export'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, user_from_request_1.GetUserFromRequest)()),
    __param(2, (0, common_1.Param)('group')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getPostGroupDebugExport", null);
__decorate([
    (0, common_1.Get)('/group/:group'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('group')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "getPostsByGroup", null);
__decorate([
    (0, common_1.Get)('/:id'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "getPost", null);
__decorate([
    (0, common_1.Post)('/valid'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "validatePosts", null);
__decorate([
    (0, common_1.Post)('/'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.POSTS_PER_MONTH]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "createPost", null);
__decorate([
    (0, common_1.Post)('/generator/draft'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.POSTS_PER_MONTH]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_generated_posts_dto_1.CreateGeneratedPostsDto]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "generatePostsDraft", null);
__decorate([
    (0, common_1.Post)('/generator'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.POSTS_PER_MONTH]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)({ passthrough: false })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, generator_dto_1.GeneratorDto, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "generatePosts", null);
__decorate([
    (0, common_1.Delete)('/:group'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('group')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "deletePost", null);
__decorate([
    (0, common_1.Put)('/:id/date'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('date')),
    __param(3, (0, common_1.Body)('action')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "changeDate", null);
__decorate([
    (0, common_1.Post)('/separate-posts'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "separatePosts", null);
exports.PostsController = PostsController = __decorate([
    (0, swagger_1.ApiTags)('Posts'),
    (0, common_1.Controller)('/posts'),
    __metadata("design:paramtypes", [posts_service_1.PostsService,
        agent_graph_service_1.AgentGraphService,
        short_link_service_1.ShortLinkService])
], PostsController);
//# sourceMappingURL=posts.controller.js.map