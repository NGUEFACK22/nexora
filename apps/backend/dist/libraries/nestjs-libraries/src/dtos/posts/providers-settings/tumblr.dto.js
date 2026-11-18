"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TumblrDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const optionalUrlRegex = /^(|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})$/;
class TumblrDto {
}
exports.TumblrDto = TumblrDto;
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(4096),
    tslib_1.__metadata("design:type", String)
], TumblrDto.prototype, "title", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.ValidateIf)((o) => o.link),
    (0, class_validator_1.Matches)(optionalUrlRegex, {
        message: 'Invalid URL',
    }),
    tslib_1.__metadata("design:type", String)
], TumblrDto.prototype, "link", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.ValidateIf)((o) => o.sourceUrl),
    (0, class_validator_1.Matches)(optionalUrlRegex, {
        message: 'Invalid URL',
    }),
    tslib_1.__metadata("design:type", String)
], TumblrDto.prototype, "sourceUrl", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(4096),
    tslib_1.__metadata("design:type", String)
], TumblrDto.prototype, "tags", void 0);
//# sourceMappingURL=tumblr.dto.js.map