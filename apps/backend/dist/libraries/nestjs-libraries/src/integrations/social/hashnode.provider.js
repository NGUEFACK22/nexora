"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashnodeProvider = void 0;
const tslib_1 = require("tslib");
const social_abstract_1 = require("@gitroom/nestjs-libraries/integrations/social.abstract");
const hashnode_tags_1 = require("@gitroom/nestjs-libraries/integrations/social/hashnode.tags");
const json_to_graphql_query_1 = require("json-to-graphql-query");
const hashnode_settings_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/hashnode.settings.dto");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const make_secure_id_1 = require("@gitroom/nestjs-libraries/services/make.secure.id");
const tool_decorator_1 = require("@gitroom/nestjs-libraries/integrations/tool.decorator");
const dashboard_function_decorator_1 = require("@gitroom/nestjs-libraries/integrations/dashboard.function.decorator");
class HashnodeProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.maxConcurrentJob = 3;
        this.identifier = 'hashnode';
        this.name = 'Hashnode';
        this.isBetweenSteps = false;
        this.scopes = [];
        this.editor = 'markdown';
        this.dto = hashnode_settings_dto_1.HashnodeSettingsDto;
    }
    maxLength() {
        return 10000;
    }
    async generateAuthUrl() {
        const state = (0, make_secure_id_1.makeSecureId)(6);
        return {
            url: state,
            codeVerifier: (0, make_secure_id_1.makeSecureId)(10),
            state,
        };
    }
    async refreshToken(refreshToken) {
        return {
            refreshToken: '',
            expiresIn: 0,
            accessToken: '',
            id: '',
            name: '',
            picture: '',
            username: '',
        };
    }
    async customFields() {
        return [
            {
                key: 'apiKey',
                label: 'API key',
                validation: `/^.{3,}$/`,
                type: 'password',
            },
        ];
    }
    async authenticate(params) {
        const body = JSON.parse(Buffer.from(params.code, 'base64').toString());
        try {
            const { data: { me: { name, id, profilePicture, username }, }, } = await (await fetch('https://gql-beta.hashnode.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${body.apiKey}`,
                },
                body: JSON.stringify({
                    query: `
                    query {
                      me {
                        name,
                        id,
                        profilePicture
                        username
                      }
                    }
                `,
                }),
            })).json();
            return {
                refreshToken: '',
                expiresIn: (0, dayjs_1.default)().add(100, 'years').unix() - (0, dayjs_1.default)().unix(),
                accessToken: body.apiKey,
                id,
                name,
                picture: profilePicture || '',
                username,
            };
        }
        catch (err) {
            return 'Invalid credentials';
        }
    }
    async tags() {
        return hashnode_tags_1.tags.map((tag) => ({ value: tag.objectID, label: tag.name }));
    }
    tagsList() {
        return hashnode_tags_1.tags;
    }
    async publications(accessToken) {
        const { data: { me: { publications: { edges }, }, }, } = await (await fetch('https://gql-beta.hashnode.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${accessToken}`,
            },
            body: JSON.stringify({
                query: `
            query {
              me {
                publications (first: 50) {
                  edges{
                    node {
                      id
                      title
                    }
                  }
                }
              }
            }
                `,
            }),
        })).json();
        return edges.map(({ node: { id, title } }) => ({
            id,
            name: title,
        }));
    }
    async post(id, accessToken, postDetails, integration) {
        const { settings } = postDetails?.[0] || { settings: {} };
        const query = (0, json_to_graphql_query_1.jsonToGraphQLQuery)({
            mutation: {
                publishPost: {
                    __args: {
                        input: {
                            title: settings.title,
                            publicationId: settings.publication,
                            ...(settings.canonical
                                ? { originalArticleURL: settings.canonical }
                                : {}),
                            contentMarkdown: postDetails?.[0].message,
                            tags: settings.tags.map((tag) => ({
                                slug: hashnode_tags_1.tags.find((t) => t.objectID === tag.value)?.slug,
                            })),
                            ...(settings.subtitle ? { subtitle: settings.subtitle } : {}),
                            ...(settings.main_image
                                ? {
                                    coverImage: `${settings?.main_image?.path?.indexOf('http') === -1
                                        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${process.env.NEXT_PUBLIC_UPLOAD_STATIC_DIRECTORY}`
                                        : ``}${settings?.main_image?.path}`,
                                }
                                : {}),
                        },
                    },
                    post: {
                        id: true,
                        url: true,
                    },
                },
            },
        }, { pretty: true });
        const { data, errors } = await (await this.fetch('https://gql-beta.hashnode.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${accessToken}`,
            },
            body: JSON.stringify({
                query,
            }),
        })).json();
        if (errors?.length || !data?.publishPost?.post) {
            throw new social_abstract_1.BadBody(this.identifier, JSON.stringify(errors || data || {}), '{}', errors?.[0]?.message || 'Hashnode could not publish the post');
        }
        const { publishPost: { post: { id: postId, url }, }, } = data;
        return [
            {
                id: postDetails?.[0].id,
                status: 'completed',
                postId: postId,
                releaseURL: url,
            },
        ];
    }
}
exports.HashnodeProvider = HashnodeProvider;
tslib_1.__decorate([
    (0, dashboard_function_decorator_1.DashboardFunction)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], HashnodeProvider.prototype, "tags", null);
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({ description: 'Tags', dataSchema: [] }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], HashnodeProvider.prototype, "tagsList", null);
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({ description: 'Publications', dataSchema: [] }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], HashnodeProvider.prototype, "publications", null);
//# sourceMappingURL=hashnode.provider.js.map