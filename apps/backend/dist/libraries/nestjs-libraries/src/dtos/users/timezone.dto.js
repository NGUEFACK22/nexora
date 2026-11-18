"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimezoneDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class TimezoneDto {
}
exports.TimezoneDto = TimezoneDto;
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsTimeZone)(),
    tslib_1.__metadata("design:type", String)
], TimezoneDto.prototype, "timezoneName", void 0);
//# sourceMappingURL=timezone.dto.js.map