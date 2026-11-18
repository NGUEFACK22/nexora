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
exports.CreateOrgUserDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateOrgUserDto {
}
exports.CreateOrgUserDto = CreateOrgUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(64),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.ValidateIf)((o) => !o.providerToken),
    __metadata("design:type", String)
], CreateOrgUserDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], CreateOrgUserDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.ValidateIf)((o) => !o.password),
    __metadata("design:type", String)
], CreateOrgUserDto.prototype, "providerToken", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.ValidateIf)((o) => !o.providerToken),
    __metadata("design:type", String)
], CreateOrgUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(128),
    __metadata("design:type", String)
], CreateOrgUserDto.prototype, "company", void 0);
//# sourceMappingURL=create.org.user.dto.js.map