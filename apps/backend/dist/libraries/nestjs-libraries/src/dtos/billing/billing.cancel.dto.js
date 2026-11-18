"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingCancelDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class BillingCancelDto {
}
exports.BillingCancelDto = BillingCancelDto;
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    tslib_1.__metadata("design:type", Boolean)
], BillingCancelDto.prototype, "cancel", void 0);
//# sourceMappingURL=billing.cancel.dto.js.map