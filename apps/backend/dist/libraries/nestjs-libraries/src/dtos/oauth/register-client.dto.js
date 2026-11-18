"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterClientDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
class RegisterClientDto {
}
exports.RegisterClientDto = RegisterClientDto;
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsDefined)(),
    tslib_1.__metadata("design:type", Array)
], RegisterClientDto.prototype, "redirect_uris", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], RegisterClientDto.prototype, "client_name", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], RegisterClientDto.prototype, "client_uri", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], RegisterClientDto.prototype, "logo_uri", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], RegisterClientDto.prototype, "token_endpoint_auth_method", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], RegisterClientDto.prototype, "grant_types", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], RegisterClientDto.prototype, "response_types", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], RegisterClientDto.prototype, "scope", void 0);
//# sourceMappingURL=register-client.dto.js.map