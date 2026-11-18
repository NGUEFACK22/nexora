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
exports.YoutubeSettingsDto = exports.YoutubeTagsSettings = exports.IsYoutubeTagsLengthConstraint = exports.YOUTUBE_TAGS_MAX_LENGTH = void 0;
exports.getYoutubeTagsLength = getYoutubeTagsLength;
exports.IsYoutubeTagsLength = IsYoutubeTagsLength;
const class_validator_1 = require("class-validator");
const media_dto_1 = require("../../media/media.dto");
const class_transformer_1 = require("class-transformer");
const class_validator_jsonschema_1 = require("class-validator-jsonschema");
exports.YOUTUBE_TAGS_MAX_LENGTH = 500;
function getYoutubeTagsLength(tags) {
    return (tags ?? []).reduce((total, tag) => {
        const label = tag?.label ?? '';
        return total + label.length + (/\s/.test(label) ? 2 : 0);
    }, 0);
}
let IsYoutubeTagsLengthConstraint = class IsYoutubeTagsLengthConstraint {
    validate(value, _args) {
        if (!Array.isArray(value)) {
            return true;
        }
        return getYoutubeTagsLength(value) <= exports.YOUTUBE_TAGS_MAX_LENGTH;
    }
    defaultMessage(_args) {
        return `The maximum allowed is ${exports.YOUTUBE_TAGS_MAX_LENGTH} characters in total for all tags.`;
    }
};
exports.IsYoutubeTagsLengthConstraint = IsYoutubeTagsLengthConstraint;
exports.IsYoutubeTagsLengthConstraint = IsYoutubeTagsLengthConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'IsYoutubeTagsLength', async: false })
], IsYoutubeTagsLengthConstraint);
function IsYoutubeTagsLength(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsYoutubeTagsLengthConstraint,
        });
    };
}
class YoutubeTagsSettings {
}
exports.YoutubeTagsSettings = YoutubeTagsSettings;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], YoutubeTagsSettings.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], YoutubeTagsSettings.prototype, "label", void 0);
class YoutubeSettingsDto {
}
exports.YoutubeSettingsDto = YoutubeSettingsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], YoutubeSettingsDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['public', 'private', 'unlisted']),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], YoutubeSettingsDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['yes', 'no']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], YoutubeSettingsDto.prototype, "selfDeclaredMadeForKids", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => media_dto_1.MediaDto),
    __metadata("design:type", media_dto_1.MediaDto)
], YoutubeSettingsDto.prototype, "thumbnail", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    IsYoutubeTagsLength(),
    (0, class_transformer_1.Type)(() => YoutubeTagsSettings),
    __metadata("design:type", Array)
], YoutubeSettingsDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'Discloses that the video has realistic altered or AI generated content (YouTube shows its altered or synthetic content label). YouTube asks for it only when the content looks realistic, not for animation or clearly unrealistic content.',
    }),
    __metadata("design:type", Boolean)
], YoutubeSettingsDto.prototype, "made_with_ai", void 0);
//# sourceMappingURL=youtube.settings.dto.js.map