"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingSyncDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class BillingSyncDto {
}
exports.BillingSyncDto = BillingSyncDto;
tslib_1.__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], BillingSyncDto.prototype, "provider", void 0);
//# sourceMappingURL=billing.sync.dto.js.map