"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizeSelfHostedDto = exports.ApproveOAuthDto = exports.AuthorizeOAuthQueryDto = void 0;
const class_validator_1 = require("class-validator");
class AuthorizeOAuthQueryDto {
}
exports.AuthorizeOAuthQueryDto = AuthorizeOAuthQueryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], AuthorizeOAuthQueryDto.prototype, "client_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsIn)(['code']),
    __metadata("design:type", String)
], AuthorizeOAuthQueryDto.prototype, "response_type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AuthorizeOAuthQueryDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AuthorizeOAuthQueryDto.prototype, "redirect_uri", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AuthorizeOAuthQueryDto.prototype, "code_challenge", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AuthorizeOAuthQueryDto.prototype, "code_challenge_method", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AuthorizeOAuthQueryDto.prototype, "scope", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AuthorizeOAuthQueryDto.prototype, "resource", void 0);
class ApproveOAuthDto {
}
exports.ApproveOAuthDto = ApproveOAuthDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], ApproveOAuthDto.prototype, "client_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ApproveOAuthDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsIn)(['approve', 'deny']),
    __metadata("design:type", String)
], ApproveOAuthDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ApproveOAuthDto.prototype, "redirect_uri", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ApproveOAuthDto.prototype, "code_challenge", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ApproveOAuthDto.prototype, "code_challenge_method", void 0);
class AuthorizeSelfHostedDto {
}
exports.AuthorizeSelfHostedDto = AuthorizeSelfHostedDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], AuthorizeSelfHostedDto.prototype, "client_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AuthorizeSelfHostedDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AuthorizeSelfHostedDto.prototype, "redirect_uri", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AuthorizeSelfHostedDto.prototype, "code_challenge", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AuthorizeSelfHostedDto.prototype, "code_challenge_method", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AuthorizeSelfHostedDto.prototype, "resource", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.MaxLength)(2048),
    __metadata("design:type", String)
], AuthorizeSelfHostedDto.prototype, "instance_url", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(512),
    __metadata("design:type", String)
], AuthorizeSelfHostedDto.prototype, "api_key", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AuthorizeSelfHostedDto.prototype, "email", void 0);
//# sourceMappingURL=authorize-oauth.dto.js.map