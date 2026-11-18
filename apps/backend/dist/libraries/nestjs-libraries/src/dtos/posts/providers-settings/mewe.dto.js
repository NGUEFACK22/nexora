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
exports.MeweDto = void 0;
const class_validator_1 = require("class-validator");
const class_validator_jsonschema_1 = require("class-validator-jsonschema");
class MeweDto {
}
exports.MeweDto = MeweDto;
__decorate([
    (0, class_validator_1.IsIn)(['timeline', 'group']),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'Where to post: timeline or group',
    }),
    __metadata("design:type", String)
], MeweDto.prototype, "postType", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.postType === 'group'),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.IsString)(),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'Group must be an id',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MeweDto.prototype, "group", void 0);
//# sourceMappingURL=mewe.dto.js.map