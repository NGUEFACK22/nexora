"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreadsDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const class_validator_jsonschema_1 = require("class-validator-jsonschema");
class ThreadsDto {
}
exports.ThreadsDto = ThreadsDto;
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'Labels the post as AI generated (Threads shows the "AI info" label). Works for text, image, video and carousel posts.',
    }),
    tslib_1.__metadata("design:type", Boolean)
], ThreadsDto.prototype, "made_with_ai", void 0);
//# sourceMappingURL=threads.dto.js.map