"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationNameDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class IntegrationNameDto {
}
exports.IntegrationNameDto = IntegrationNameDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    tslib_1.__metadata("design:type", String)
], IntegrationNameDto.prototype, "name", void 0);
//# sourceMappingURL=integration.name.dto.js.map