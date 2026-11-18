"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostValidationExceptionFilter = exports.PostValidationException = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
class PostValidationException extends common_1.HttpException {
    constructor(message) {
        super(message, common_1.HttpStatus.BAD_REQUEST);
    }
}
exports.PostValidationException = PostValidationException;
let PostValidationExceptionFilter = class PostValidationExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception.getStatus();
        const { provider, name, error } = exception.getResponse();
        response.status(status).json({
            statusCode: status,
            provider,
            name,
            message: error,
        });
    }
};
exports.PostValidationExceptionFilter = PostValidationExceptionFilter;
exports.PostValidationExceptionFilter = PostValidationExceptionFilter = tslib_1.__decorate([
    (0, common_1.Catch)(PostValidationException)
], PostValidationExceptionFilter);
//# sourceMappingURL=posts.validation.exception.js.map