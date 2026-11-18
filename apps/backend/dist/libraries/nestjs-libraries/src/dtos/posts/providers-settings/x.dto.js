"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const class_validator_jsonschema_1 = require("class-validator-jsonschema");
const media_dto_1 = require("@gitroom/nestjs-libraries/dtos/media/media.dto");
class XDto {
}
exports.XDto = XDto;
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^(https:\/\/x\.com\/i\/communities\/\d+)?$/, {
        message: 'Invalid X community URL. It should be in the format: https://x.com/i/communities/1493446837214187523',
    }),
    tslib_1.__metadata("design:type", String)
], XDto.prototype, "community", void 0);
tslib_1.__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.post_type !== 'article'),
    (0, class_validator_1.IsIn)(['everyone', 'following', 'mentionedUsers', 'subscribers', 'verified']),
    tslib_1.__metadata("design:type", String)
], XDto.prototype, "who_can_reply_post", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['post', 'article']),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'post = a regular short post (plain text). article = a long-form X article: write the post content as HTML (p, h1, h2, h3, ul, ol, li, strong, u, a) - the formatting is kept in the article',
    }),
    tslib_1.__metadata("design:type", String)
], XDto.prototype, "post_type", void 0);
tslib_1.__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.post_type === 'article'),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: 'Article title is required' }),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'The title of the article, required when post_type is article',
    }),
    tslib_1.__metadata("design:type", String)
], XDto.prototype, "article_title", void 0);
tslib_1.__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.post_type === 'article'),
    (0, class_validator_1.IsIn)(['draft', 'published']),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'draft = save the article as a draft on X, published = publish it right away, required when post_type is article',
    }),
    tslib_1.__metadata("design:type", String)
], XDto.prototype, "article_status", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => media_dto_1.MediaDto),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'Optional cover image for the article, only used when post_type is article',
    }),
    tslib_1.__metadata("design:type", media_dto_1.MediaDto)
], XDto.prototype, "article_cover", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    tslib_1.__metadata("design:type", Boolean)
], XDto.prototype, "made_with_ai", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    tslib_1.__metadata("design:type", Boolean)
], XDto.prototype, "paid_partnership", void 0);
//# sourceMappingURL=x.dto.js.map