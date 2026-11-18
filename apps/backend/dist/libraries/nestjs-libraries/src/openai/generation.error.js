"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generationError = generationError;
const common_1 = require("@nestjs/common");
const SAFETY_VIOLATIONS_REGEX = /safety_violations=\[([^\]]*)\]/i;
const SAFETY_MESSAGE_REGEX = /safety system|safety_violations|content[ _]policy|rejected as a result of our safety|moderation/i;
function generationError(err) {
    if (err instanceof common_1.HttpException) {
        return err;
    }
    const message = err?.error?.message || err?.message || String(err || '');
    if (SAFETY_MESSAGE_REGEX.test(message)) {
        const categories = message.match(SAFETY_VIOLATIONS_REGEX)?.[1]?.trim();
        const detail = categories ? ` Flagged categories: ${categories}.` : '';
        return new common_1.HttpException(`Your request was rejected by the AI safety system.${detail} Please adjust your prompt and try again.`, 422);
    }
    console.error('AI generation failed:', message);
    return new common_1.HttpException('AI generation failed, please try again later.', 500);
}
//# sourceMappingURL=generation.error.js.map