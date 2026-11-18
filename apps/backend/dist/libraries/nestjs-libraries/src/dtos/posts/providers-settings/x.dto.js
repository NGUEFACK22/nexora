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
exports.XDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const class_validator_jsonschema_1 = require("class-validator-jsonschema");
const media_dto_1 = require("../../media/media.dto");
class XDto {
}
exports.XDto = XDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^(https:\/\/x\.com\/i\/communities\/\d+)?$/, {
        message: 'Invalid X community URL. It should be in the format: https://x.com/i/communities/1493446837214187523',
    }),
    __metadata("design:type", String)
], XDto.prototype, "community", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.post_type !== 'article'),
    (0, class_validator_1.IsIn)(['everyone', 'following', 'mentionedUsers', 'subscribers', 'verified']),
    __metadata("design:type", String)
], XDto.prototype, "who_can_reply_post", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['post', 'article']),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'post = a regular short post (plain text). article = a long-form X article: write the post content as HTML (p, h1, h2, h3, ul, ol, li, strong, u, a) - the formatting is kept in the article',
    }),
    __metadata("design:type", String)
], XDto.prototype, "post_type", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.post_type === 'article'),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: 'Article title is required' }),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'The title of the article, required when post_type is article',
    }),
    __metadata("design:type", String)
], XDto.prototype, "article_title", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.post_type === 'article'),
    (0, class_validator_1.IsIn)(['draft', 'published']),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'draft = save the article as a draft on X, published = publish it right away, required when post_type is article',
    }),
    __metadata("design:type", String)
], XDto.prototype, "article_status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => media_dto_1.MediaDto),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'Optional cover image for the article, only used when post_type is article',
    }),
    __metadata("design:type", media_dto_1.MediaDto)
], XDto.prototype, "article_cover", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], XDto.prototype, "made_with_ai", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], XDto.prototype, "paid_partnership", void 0);
//# sourceMappingURL=x.dto.js.map