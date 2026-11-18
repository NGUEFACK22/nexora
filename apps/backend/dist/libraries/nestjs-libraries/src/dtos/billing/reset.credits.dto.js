"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetCreditsDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class ResetCreditsDto {
}
exports.ResetCreditsDto = ResetCreditsDto;
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['ai_images', 'ai_videos']),
    tslib_1.__metadata("design:type", String)
], ResetCreditsDto.prototype, "type", void 0);
//# sourceMappingURL=reset.credits.dto.js.map