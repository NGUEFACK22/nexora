"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubspotInstallQueryDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class HubspotInstallQueryDto {
}
exports.HubspotInstallQueryDto = HubspotInstallQueryDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    tslib_1.__metadata("design:type", String)
], HubspotInstallQueryDto.prototype, "code", void 0);
//# sourceMappingURL=hubspot-install.dto.js.map