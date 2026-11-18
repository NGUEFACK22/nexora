"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerNameDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class CustomerNameDto {
}
exports.CustomerNameDto = CustomerNameDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    tslib_1.__metadata("design:type", String)
], CustomerNameDto.prototype, "name", void 0);
//# sourceMappingURL=customer.name.dto.js.map