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
exports.PlugDto = exports.FieldsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class FieldsDto {
}
exports.FieldsDto = FieldsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], FieldsDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], FieldsDto.prototype, "value", void 0);
class PlugDto {
}
exports.PlugDto = PlugDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], PlugDto.prototype, "func", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => FieldsDto),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", Array)
], PlugDto.prototype, "fields", void 0);
//# sourceMappingURL=plug.dto.js.map