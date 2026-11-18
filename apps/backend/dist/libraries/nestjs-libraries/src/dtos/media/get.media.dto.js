"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMediaDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class GetMediaDto {
    constructor() {
        this.page = 1;
    }
}
exports.GetMediaDto = GetMediaDto;
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value, 10)),
    tslib_1.__metadata("design:type", Number)
], GetMediaDto.prototype, "page", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], GetMediaDto.prototype, "search", void 0);
//# sourceMappingURL=get.media.dto.js.map