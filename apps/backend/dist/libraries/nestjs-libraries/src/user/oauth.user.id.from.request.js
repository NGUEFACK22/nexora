"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOAuthUserIdFromRequest = void 0;
const common_1 = require("@nestjs/common");
exports.GetOAuthUserIdFromRequest = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.oauthUserId;
});
//# sourceMappingURL=oauth.user.id.from.request.js.map