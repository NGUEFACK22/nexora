"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrgActivityDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class GetOrgActivityDto {
}
exports.GetOrgActivityDto = GetOrgActivityDto;
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], GetOrgActivityDto.prototype, "from", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    tslib_1.__metadata("design:type", String)
], GetOrgActivityDto.prototype, "to", void 0);
//# sourceMappingURL=get.org.activity.dto.js.map