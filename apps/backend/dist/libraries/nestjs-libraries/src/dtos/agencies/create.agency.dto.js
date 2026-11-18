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
exports.CreateAgencyDto = exports.CreateAgencyLogoDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateAgencyLogoDto {
}
exports.CreateAgencyLogoDto = CreateAgencyLogoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], CreateAgencyLogoDto.prototype, "id", void 0);
class CreateAgencyDto {
}
exports.CreateAgencyDto = CreateAgencyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], CreateAgencyDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], CreateAgencyDto.prototype, "website", void 0);
__decorate([
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.ValidateIf)((o) => o.facebook),
    __metadata("design:type", String)
], CreateAgencyDto.prototype, "facebook", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAgencyDto.prototype, "instagram", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAgencyDto.prototype, "twitter", void 0);
__decorate([
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.ValidateIf)((o) => o.linkedIn),
    __metadata("design:type", String)
], CreateAgencyDto.prototype, "linkedIn", void 0);
__decorate([
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.ValidateIf)((o) => o.youtube),
    __metadata("design:type", String)
], CreateAgencyDto.prototype, "youtube", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAgencyDto.prototype, "tiktok", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => CreateAgencyLogoDto),
    __metadata("design:type", CreateAgencyLogoDto)
], CreateAgencyDto.prototype, "logo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAgencyDto.prototype, "shortDescription", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAgencyDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)({
        each: true,
    }),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(3),
    (0, class_validator_1.IsIn)([
        'Real Estate',
        'Fashion',
        'Health and Fitness',
        'Beauty',
        'Travel',
        'Food',
        'Tech',
        'Gaming',
        'Parenting',
        'Education',
        'Business',
        'Finance',
        'DIY',
        'Pets',
        'Lifestyle',
        'Sports',
        'Entertainment',
        'Art',
        'Photography',
        'Sustainability',
    ], {
        each: true,
    }),
    __metadata("design:type", Array)
], CreateAgencyDto.prototype, "niches", void 0);
//# sourceMappingURL=create.agency.dto.js.map