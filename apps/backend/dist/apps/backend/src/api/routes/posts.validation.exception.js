"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostValidationExceptionFilter = exports.PostValidationException = void 0;
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
exports.PostValidationExceptionFilter = PostValidationExceptionFilter = __decorate([
    (0, common_1.Catch)(PostValidationException)
], PostValidationExceptionFilter);
//# sourceMappingURL=posts.validation.exception.js.map