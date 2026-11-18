"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = exports.HttpForbiddenException = void 0;
const common_1 = require("@nestjs/common");
const auth_middleware_1 = require("../../../../apps/backend/src/services/auth/auth.middleware");
class HttpForbiddenException extends common_1.HttpException {
    constructor() {
        super('Forbidden', 403);
    }
}
exports.HttpForbiddenException = HttpForbiddenException;
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        (0, auth_middleware_1.removeAuth)(response);
        return response.status(401).send();
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)(HttpForbiddenException)
], HttpExceptionFilter);
//# sourceMappingURL=exception.filter.js.map