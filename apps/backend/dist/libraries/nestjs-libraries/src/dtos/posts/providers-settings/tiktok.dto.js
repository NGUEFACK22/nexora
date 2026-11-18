"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TikTokDto = exports.TikTokLocation = exports.TikTokMusic = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const class_validator_jsonschema_1 = require("class-validator-jsonschema");
class TikTokMusic {
}
exports.TikTokMusic = TikTokMusic;
tslib_1.__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'The commercial music library track id, taken from the "id" returned by the musicSearch function.',
    }),
    tslib_1.__metadata("design:type", String)
], TikTokMusic.prototype, "id", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TikTokMusic.prototype, "title", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TikTokMusic.prototype, "artist", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TikTokMusic.prototype, "image", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    tslib_1.__metadata("design:type", Number)
], TikTokMusic.prototype, "audio_volume", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    tslib_1.__metadata("design:type", Number)
], TikTokMusic.prototype, "video_volume", void 0);
class TikTokLocation {
}
exports.TikTokLocation = TikTokLocation;
tslib_1.__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'The location tag id, taken from the "id" returned by the locationSearch function.',
    }),
    tslib_1.__metadata("design:type", String)
], TikTokLocation.prototype, "id", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TikTokLocation.prototype, "name", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], TikTokLocation.prototype, "address", void 0);
class TikTokDto {
}
exports.TikTokDto = TikTokDto;
tslib_1.__decorate([
    (0, class_validator_1.ValidateIf)((p) => p.title),
    (0, class_validator_1.MaxLength)(90),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'Used as the title of the post. The only setting TikTok keeps when content_posting_method=UPLOAD.',
    }),
    tslib_1.__metadata("design:type", String)
], TikTokDto.prototype, "title", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsIn)([
        'PUBLIC_TO_EVERYONE',
        'MUTUAL_FOLLOW_FRIENDS',
        'FOLLOWER_OF_CREATOR',
        'SELF_ONLY',
    ]),
    (0, class_validator_1.IsString)(),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'Applied only when content_posting_method=DIRECT_POST. Ignored by TikTok on UPLOAD.',
    }),
    tslib_1.__metadata("design:type", String)
], TikTokDto.prototype, "privacy_level", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'Video posts only, and only when content_posting_method=DIRECT_POST. TikTok has no duet setting for photo posts.',
    }),
    tslib_1.__metadata("design:type", Boolean)
], TikTokDto.prototype, "duet", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'Video posts only, and only when content_posting_method=DIRECT_POST. TikTok has no stitch setting for photo posts.',
    }),
    tslib_1.__metadata("design:type", Boolean)
], TikTokDto.prototype, "stitch", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'Applied only when content_posting_method=DIRECT_POST. Ignored by TikTok on UPLOAD.',
    }),
    tslib_1.__metadata("design:type", Boolean)
], TikTokDto.prototype, "comment", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsIn)(['yes', 'no']),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'Photo posts only, and only when content_posting_method=DIRECT_POST. Ignored by TikTok on UPLOAD. ' +
            'On TikTok Business, "yes" attaches a random commercial music library track and overrides the music setting; ' +
            'on legacy TikTok, "yes" lets TikTok auto-add its recommended music.',
    }),
    tslib_1.__metadata("design:type", String)
], TikTokDto.prototype, "autoAddMusic", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'Applied only when content_posting_method=DIRECT_POST. Ignored by TikTok on UPLOAD.',
    }),
    tslib_1.__metadata("design:type", Boolean)
], TikTokDto.prototype, "brand_content_toggle", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'Labels the post as AI generated. Video posts only, and only when content_posting_method=DIRECT_POST. TikTok has no AI-generated label for photo posts, and discards it on UPLOAD.',
    }),
    tslib_1.__metadata("design:type", Boolean)
], TikTokDto.prototype, "video_made_with_ai", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'Applied only when content_posting_method=DIRECT_POST. Ignored by TikTok on UPLOAD.',
    }),
    tslib_1.__metadata("design:type", Boolean)
], TikTokDto.prototype, "brand_organic_toggle", void 0);
tslib_1.__decorate([
    (0, class_transformer_1.Type)(() => TikTokMusic),
    (0, class_validator_1.ValidateNested)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'TikTok Business only, and only when content_posting_method=DIRECT_POST. Attaches a commercial music library track to the post (use the musicSearch function to find one). audio_volume / video_volume apply to video posts only. For photos, ignored when autoAddMusic is "yes" (a random track is attached instead).',
    }),
    tslib_1.__metadata("design:type", TikTokMusic)
], TikTokDto.prototype, "music", void 0);
tslib_1.__decorate([
    (0, class_transformer_1.Type)(() => TikTokLocation),
    (0, class_validator_1.ValidateNested)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'TikTok Business only, and only when content_posting_method=DIRECT_POST. Tags the post with a location (use the locationSearch function to find one).',
    }),
    tslib_1.__metadata("design:type", TikTokLocation)
], TikTokDto.prototype, "location", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsIn)(['DIRECT_POST', 'UPLOAD']),
    (0, class_validator_1.IsString)(),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'Required. Use "DIRECT_POST" to actually publish the post to TikTok. ' +
            '"UPLOAD" does NOT publish: it only sends the media to the user\'s TikTok app inbox, ' +
            'where they must manually finish and publish it within 24 hours or it is discarded, ' +
            'and it makes TikTok ignore every other setting here. ' +
            'Only use "UPLOAD" when the user explicitly asks to review or edit the post inside the TikTok app before publishing.',
    }),
    tslib_1.__metadata("design:type", String)
], TikTokDto.prototype, "content_posting_method", void 0);
//# sourceMappingURL=tiktok.dto.js.map