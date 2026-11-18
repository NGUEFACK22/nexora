"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidContent = void 0;
const class_validator_1 = require("class-validator");
const striptags_1 = __importDefault(require("striptags"));
let ValidContent = class ValidContent {
    validate(contentRaw, args) {
        const content = (0, striptags_1.default)(contentRaw || '');
        if ((!args?.object?.image || !Array.isArray(args?.object?.image) || !args?.object?.image.length) &&
            (!content || typeof content !== 'string' || content?.trim() === '')) {
            return false;
        }
        return true;
    }
    defaultMessage(args) {
        return ' If images do not exist, content must be a non-empty string.';
    }
};
exports.ValidContent = ValidContent;
exports.ValidContent = ValidContent = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'validateContent', async: false })
], ValidContent);
//# sourceMappingURL=valid.images.js.map