"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClippingDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class ClippingDto {
}
exports.ClippingDto = ClippingDto;
tslib_1.__decorate([
    (0, class_validator_1.IsUrl)({ require_protocol: true, protocols: ['http', 'https'] }),
    tslib_1.__metadata("design:type", String)
], ClippingDto.prototype, "url", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(20),
    (0, class_validator_1.IsString)({ each: true }),
    tslib_1.__metadata("design:type", Array)
], ClippingDto.prototype, "integrations", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    tslib_1.__metadata("design:type", Number)
], ClippingDto.prototype, "clips", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['crop', 'blur']),
    tslib_1.__metadata("design:type", String)
], ClippingDto.prototype, "fit", void 0);
//# sourceMappingURL=clipping.dto.js.map