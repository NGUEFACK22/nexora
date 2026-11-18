"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidUrlPath = exports.isAllowedUploadPath = exports.ValidUrlExtension = void 0;
const class_validator_1 = require("class-validator");
let ValidUrlExtension = class ValidUrlExtension {
    validate(text, args) {
        return (!!text?.split?.('?')?.[0].endsWith('.png') ||
            !!text?.split?.('?')?.[0].endsWith('.jpg') ||
            !!text?.split?.('?')?.[0].endsWith('.jpeg') ||
            !!text?.split?.('?')?.[0].endsWith('.gif') ||
            !!text?.split?.('?')?.[0].endsWith('.webp') ||
            !!text?.split?.('?')?.[0].endsWith('.mp4'));
    }
    defaultMessage(args) {
        return ('File must have a valid extension: .png, .jpg, .jpeg, .gif, .webp, or .mp4');
    }
};
exports.ValidUrlExtension = ValidUrlExtension;
exports.ValidUrlExtension = ValidUrlExtension = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'checkValidExtension', async: false })
], ValidUrlExtension);
const isAllowedUploadPath = (text) => {
    if (!process.env.RESTRICT_UPLOAD_DOMAINS) {
        return true;
    }
    return ((text || 'invalid url').indexOf(process.env.RESTRICT_UPLOAD_DOMAINS) > -1);
};
exports.isAllowedUploadPath = isAllowedUploadPath;
let ValidUrlPath = class ValidUrlPath {
    validate(text, args) {
        return (0, exports.isAllowedUploadPath)(text);
    }
    defaultMessage(args) {
        return ('URL must contain the domain: ' + process.env.RESTRICT_UPLOAD_DOMAINS + ' Make sure you first use the upload API route.');
    }
};
exports.ValidUrlPath = ValidUrlPath;
exports.ValidUrlPath = ValidUrlPath = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'checkValidPath', async: false })
], ValidUrlPath);
//# sourceMappingURL=valid.url.path.js.map