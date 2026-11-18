"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectLinkDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const all_providers_settings_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/all.providers.settings");
class ConnectLinkDto {
}
exports.ConnectLinkDto = ConnectLinkDto;
tslib_1.__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsIn)((0, all_providers_settings_1.allProviders)(all_providers_settings_1.EmptySettings).map((p) => p.name), {
        message: `"integration" must be ${(0, all_providers_settings_1.allProviders)(all_providers_settings_1.EmptySettings)
            .map((p) => p.name)
            .join(', ')}`,
    }),
    tslib_1.__metadata("design:type", String)
], ConnectLinkDto.prototype, "integration", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({
        protocols: ['http', 'https'],
        require_protocol: true,
        require_tld: false,
    }),
    tslib_1.__metadata("design:type", String)
], ConnectLinkDto.prototype, "redirectUrl", void 0);
//# sourceMappingURL=connect.link.dto.js.map