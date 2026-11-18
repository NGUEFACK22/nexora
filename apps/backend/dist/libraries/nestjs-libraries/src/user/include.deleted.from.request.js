"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetIncludeDeletedFromRequest = void 0;
const common_1 = require("@nestjs/common");
exports.GetIncludeDeletedFromRequest = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return !!request.includeDeleted;
});
//# sourceMappingURL=include.deleted.from.request.js.map