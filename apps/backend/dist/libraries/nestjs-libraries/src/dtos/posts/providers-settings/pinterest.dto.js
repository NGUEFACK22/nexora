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
exports.PinterestSettingsDto = void 0;
const class_validator_1 = require("class-validator");
const class_validator_jsonschema_1 = require("class-validator-jsonschema");
class PinterestSettingsDto {
}
exports.PinterestSettingsDto = PinterestSettingsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.ValidateIf)((o) => !!o.title),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], PinterestSettingsDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.ValidateIf)((o) => !!o.link),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], PinterestSettingsDto.prototype, "link", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.ValidateIf)((o) => !!o.dominant_color),
    __metadata("design:type", String)
], PinterestSettingsDto.prototype, "dominant_color", void 0);
__decorate([
    (0, class_validator_1.IsDefined)({
        message: 'Board is required',
    }),
    (0, class_validator_1.IsString)({
        message: 'Board is required',
    }),
    (0, class_validator_1.MinLength)(1, {
        message: 'Board is required',
    }),
    (0, class_validator_1.Matches)(/^\d+$/, {
        message: 'Board must be the numeric board id (use the boards list of the channel to find it), not the board name',
    }),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'The numeric id of the board (from the boards list of the channel), not the board name',
    }),
    __metadata("design:type", String)
], PinterestSettingsDto.prototype, "board", void 0);
//# sourceMappingURL=pinterest.dto.js.map