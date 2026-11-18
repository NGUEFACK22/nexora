"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminApplyCouponDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class AdminApplyCouponDto {
}
exports.AdminApplyCouponDto = AdminApplyCouponDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['percentage', 'amount']),
    tslib_1.__metadata("design:type", String)
], AdminApplyCouponDto.prototype, "type", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    tslib_1.__metadata("design:type", Number)
], AdminApplyCouponDto.prototype, "value", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    tslib_1.__metadata("design:type", Number)
], AdminApplyCouponDto.prototype, "months", void 0);
//# sourceMappingURL=admin.apply.coupon.dto.js.map