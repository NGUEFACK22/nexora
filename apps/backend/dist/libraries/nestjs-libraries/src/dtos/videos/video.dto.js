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
exports.VideoDto = exports.ValidIn = void 0;
const class_validator_1 = require("class-validator");
const video_interface_1 = require("../../videos/video.interface");
let ValidIn = class ValidIn {
    _load() {
        return (Reflect.getMetadata('video', video_interface_1.VideoAbstract) || [])
            .filter((f) => f.available)
            .map((p) => p.identifier);
    }
    validate(text, args) {
        const validTypes = this._load();
        return validTypes.includes(text);
    }
    defaultMessage(args) {
        return 'type must be any of: ' + this._load().join(', ');
    }
};
exports.ValidIn = ValidIn;
exports.ValidIn = ValidIn = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'checkInRuntime', async: false })
], ValidIn);
class VideoDto {
}
exports.VideoDto = VideoDto;
__decorate([
    (0, class_validator_1.Validate)(ValidIn),
    __metadata("design:type", String)
], VideoDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['vertical', 'horizontal']),
    __metadata("design:type", String)
], VideoDto.prototype, "output", void 0);
//# sourceMappingURL=video.dto.js.map