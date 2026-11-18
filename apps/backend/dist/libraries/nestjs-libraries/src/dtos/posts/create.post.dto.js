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
exports.CreatePostDto = exports.Post = exports.PostContent = exports.Integration = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const media_dto_1 = require("../media/media.dto");
const all_providers_settings_1 = require("./providers-settings/all.providers.settings");
const valid_images_1 = require("../../../../helpers/src/utils/valid.images");
const sanitize_post_content_1 = require("../../../../helpers/src/utils/sanitize.post.content");
class Integration {
}
exports.Integration = Integration;
__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Integration.prototype, "id", void 0);
class PostContent {
}
exports.PostContent = PostContent;
__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Validate)(valid_images_1.ValidContent),
    (0, class_transformer_1.Transform)(({ value }) => (0, sanitize_post_content_1.sanitizePostContent)(value)),
    __metadata("design:type", String)
], PostContent.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PostContent.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PostContent.prototype, "delay", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Type)(() => media_dto_1.MediaDto),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", Array)
], PostContent.prototype, "image", void 0);
class Post {
}
exports.Post = Post;
__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_transformer_1.Type)(() => Integration),
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", Integration)
], Post.prototype, "integration", void 0);
__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Type)(() => PostContent),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", Array)
], Post.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Post.prototype, "group", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], Post.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.type !== 'draft'),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => all_providers_settings_1.EmptySettings, {
        keepDiscriminatorProperty: true,
        discriminator: {
            property: '__type',
            subTypes: (0, all_providers_settings_1.allProviders)(all_providers_settings_1.EmptySettings),
        },
    }),
    __metadata("design:type", Object)
], Post.prototype, "settings", void 0);
class Tags {
}
__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Tags.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Tags.prototype, "label", void 0);
class CreatePostDto {
}
exports.CreatePostDto = CreatePostDto;
__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsIn)(['draft', 'schedule', 'now', 'update']),
    __metadata("design:type", String)
], CreatePostDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePostDto.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePostDto.prototype, "shortLink", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePostDto.prototype, "inter", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePostDto.prototype, "republish", void 0);
__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePostDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", Array)
], CreatePostDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_transformer_1.Type)(() => Post),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    __metadata("design:type", Array)
], CreatePostDto.prototype, "posts", void 0);
//# sourceMappingURL=create.post.dto.js.map