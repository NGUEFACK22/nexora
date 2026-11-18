"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveCommentDto = exports.CreatePublicCommentDto = exports.AddCommentDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class AddCommentDto {
}
exports.AddCommentDto = AddCommentDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(2000),
    tslib_1.__metadata("design:type", String)
], AddCommentDto.prototype, "content", void 0);
class CreatePublicCommentDto extends AddCommentDto {
}
exports.CreatePublicCommentDto = CreatePublicCommentDto;
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreatePublicCommentDto.prototype, "postId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], CreatePublicCommentDto.prototype, "anchorStart", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    tslib_1.__metadata("design:type", Number)
], CreatePublicCommentDto.prototype, "anchorEnd", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    tslib_1.__metadata("design:type", String)
], CreatePublicCommentDto.prototype, "anchorQuote", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreatePublicCommentDto.prototype, "parentId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(80),
    tslib_1.__metadata("design:type", String)
], CreatePublicCommentDto.prototype, "displayName", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreatePublicCommentDto.prototype, "recaptchaToken", void 0);
class ResolveCommentDto {
}
exports.ResolveCommentDto = ResolveCommentDto;
tslib_1.__decorate([
    (0, class_validator_1.IsBoolean)(),
    tslib_1.__metadata("design:type", Boolean)
], ResolveCommentDto.prototype, "resolved", void 0);
//# sourceMappingURL=add.comment.dto.js.map