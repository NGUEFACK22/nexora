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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordpressProvider = void 0;
const social_abstract_1 = require("../social.abstract");
const dayjs_1 = __importDefault(require("dayjs"));
const make_secure_id_1 = require("../../services/make.secure.id");
const wordpress_dto_1 = require("../../dtos/posts/providers-settings/wordpress.dto");
const slugify_1 = __importDefault(require("slugify"));
const tool_decorator_1 = require("../tool.decorator");
const rules_description_decorator_1 = require("../../chat/rules.description.decorator");
const ssrf_safe_dispatcher_1 = require("../../dtos/webhooks/ssrf.safe.dispatcher");
const WORDPRESS_USER_AGENT = 'Nexora/1.0 (+https://Nexora.com)';
let WordpressProvider = class WordpressProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.identifier = 'wordpress';
        this.name = 'WordPress';
        this.isBetweenSteps = false;
        this.editor = 'html';
        this.scopes = [];
        this.maxConcurrentJob = 8;
        this.dto = wordpress_dto_1.WordpressDto;
    }
    maxLength() {
        return 100000;
    }
    inlineImages() {
        return true;
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
    handleErrors(body) {
        if (body.indexOf('rest_cannot_create') > -1) {
            return {
                type: 'bad-body',
                value: 'The connect user has insufficient permissions to create posts',
            };
        }
        return undefined;
    }
    async customFields() {
        return [
            {
                key: 'domain',
                label: 'Domain URL',
                validation: `/^https?:\\/\\/(?:www\\.)?[\\w\\-]+(\\.[\\w\\-]+)+([\\/?#][^\\s]*)?$/`,
                type: 'text',
            },
            {
                key: 'username',
                label: 'Username',
                validation: `/.+/`,
                type: 'text',
            },
            {
                key: 'password',
                label: 'Password',
                validation: `/.+/`,
                type: 'password',
                hint: 'Application password, create in User->Profile',
            },
        ];
    }
    async authenticate(params) {
        const body = JSON.parse(Buffer.from(params.code, 'base64').toString());
        const domain = body.domain.trim().replace(/\/+$/, '');
        const auth = Buffer.from(`${body.username}:${body.password}`).toString('base64');
        let response;
        try {
            response = await fetch(`${domain}/wp-json/wp/v2/users/me`, {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'User-Agent': WORDPRESS_USER_AGENT,
                },
                dispatcher: (0, ssrf_safe_dispatcher_1.getSsrfSafeDispatcher)(),
            });
        }
        catch (err) {
            console.log(err);
            return 'Could not reach your WordPress site. Check the Domain URL and that the site is publicly accessible.';
        }
        if (!response.ok) {
            const errorBody = await response.text().catch(() => '');
            let wpCode = '';
            let wpMessage = '';
            try {
                const parsed = JSON.parse(errorBody);
                wpCode = parsed?.code || '';
                wpMessage = parsed?.message || '';
            }
            catch (err) {
            }
            console.log(`WordPress auth failed for ${domain} (HTTP ${response.status})`, JSON.stringify({
                code: wpCode,
                message: wpMessage,
                ...(wpCode ? {} : { body: errorBody.slice(0, 500) }),
            }));
            if (response.status === 401 || response.status === 403) {
                return 'WordPress rejected the login. A security plugin or server setting may be blocking the REST API or stripping the Authorization header, or the username / Application Password is incorrect.';
            }
            return `WordPress returned an unexpected error (HTTP ${response.status}). Make sure the REST API is enabled and Application Passwords are available.`;
        }
        let data;
        try {
            data = await response.json();
        }
        catch (err) {
            console.log(err);
            return 'WordPress did not return a valid response. The REST API may be disabled or blocked by a security plugin.';
        }
        const { id, name, avatar_urls, code } = data || {};
        if (code) {
            return 'Invalid credentials';
        }
        const biggestImage = Object.entries(avatar_urls || {}).reduce((all, current) => {
            if (all > Number(current[0])) {
                return all;
            }
            return Number(current[0]);
        }, 0);
        return {
            refreshToken: '',
            expiresIn: (0, dayjs_1.default)().add(100, 'years').unix() - (0, dayjs_1.default)().unix(),
            accessToken: params.code,
            id: body.domain + '_' + id,
            name,
            picture: avatar_urls?.[String(biggestImage)] || '',
            username: body.username,
        };
    }
    async wpGet(token, path) {
        const body = JSON.parse(Buffer.from(token, 'base64').toString());
        const auth = Buffer.from(`${body.username}:${body.password}`).toString('base64');
        const response = await fetch(`${body.domain}${path}`, {
            headers: {
                Authorization: `Basic ${auth}`,
                'User-Agent': WORDPRESS_USER_AGENT,
            },
            dispatcher: (0, ssrf_safe_dispatcher_1.getSsrfSafeDispatcher)(),
        });
        return response.json();
    }
    async postTypes(token) {
        const postTypes = await this.wpGet(token, '/wp-json/wp/v2/types');
        return Object.entries(postTypes).reduce((all, [key, value]) => {
            if (key.indexOf('wp_') > -1 ||
                key.indexOf('nav_') > -1 ||
                key === 'attachment') {
                return all;
            }
            all.push({
                id: value.rest_base,
                name: value.name,
            });
            return all;
        }, []);
    }
    async categoriesList(token) {
        const categories = await this.wpGet(token, '/wp-json/wp/v2/categories?per_page=100');
        return (Array.isArray(categories) ? categories : []).map((category) => ({
            id: category.id,
            name: category.name,
        }));
    }
    async tagsList(token) {
        const tags = await this.wpGet(token, '/wp-json/wp/v2/tags?per_page=100');
        return (Array.isArray(tags) ? tags : []).map((tag) => ({
            id: tag.id,
            name: tag.name,
        }));
    }
    async post(id, accessToken, postDetails, integration) {
        const body = JSON.parse(Buffer.from(accessToken, 'base64').toString());
        const auth = Buffer.from(`${body.username}:${body.password}`).toString('base64');
        let mediaId = '';
        if (postDetails?.[0]?.settings?.main_image?.path) {
            console.log('Uploading image to WordPress', postDetails[0].settings.main_image.path);
            const blob = await this.fetch(postDetails[0].settings.main_image.path).then((r) => r.blob());
            const mediaResponse = await (await this.fetch(`${body.domain}/wp-json/wp/v2/media`, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Disposition': `attachment; filename="${postDetails[0].settings.main_image.path
                        .split('/')
                        .pop()}"`,
                    'Content-Type': blob.type,
                    'User-Agent': WORDPRESS_USER_AGENT,
                },
                body: blob,
            })).json();
            mediaId = mediaResponse.id;
        }
        const categories = (postDetails?.[0]?.settings?.categories || [])
            .map((category) => Number(category))
            .filter((category) => !isNaN(category));
        const tags = (postDetails?.[0]?.settings?.tags || [])
            .map((tag) => Number(tag))
            .filter((tag) => !isNaN(tag));
        const submit = await (await this.fetch(`${body.domain}/wp-json/wp/v2/${postDetails?.[0]?.settings?.type}`, {
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/json',
                'User-Agent': WORDPRESS_USER_AGENT,
            },
            method: 'POST',
            body: JSON.stringify({
                title: postDetails?.[0]?.settings?.title,
                content: postDetails?.[0]?.message,
                slug: (0, slugify_1.default)(postDetails?.[0]?.settings?.title, {
                    lower: true,
                    strict: true,
                    trim: true,
                }),
                status: postDetails?.[0]?.settings?.status || 'publish',
                ...(categories.length ? { categories } : {}),
                ...(tags.length ? { tags } : {}),
                ...(mediaId ? { featured_media: mediaId } : {}),
            }),
        })).json();
        return [
            {
                id: postDetails?.[0].id,
                status: 'completed',
                postId: String(submit.id),
                releaseURL: submit.link,
            },
        ];
    }
};
exports.WordpressProvider = WordpressProvider;
__decorate([
    (0, tool_decorator_1.Tool)({
        description: 'Get list of post types',
        dataSchema: [],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WordpressProvider.prototype, "postTypes", null);
__decorate([
    (0, tool_decorator_1.Tool)({
        description: 'Get list of categories',
        dataSchema: [],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WordpressProvider.prototype, "categoriesList", null);
__decorate([
    (0, tool_decorator_1.Tool)({
        description: 'Get list of tags',
        dataSchema: [],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WordpressProvider.prototype, "tagsList", null);
exports.WordpressProvider = WordpressProvider = __decorate([
    (0, rules_description_decorator_1.Rules)('WordPress publishes the content as an article: pictures go inside the content as <img src="..."> where they should appear, the src must be a picture from the media library (upload it with uploadFromUrlTool first), attachments are not published, the cover picture is the main_image setting')
], WordpressProvider);
//# sourceMappingURL=wordpress.provider.js.map