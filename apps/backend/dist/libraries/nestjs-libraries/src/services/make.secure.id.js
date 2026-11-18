"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSecureId = void 0;
const crypto_1 = require("crypto");
const makeSecureId = (length) => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i += 1) {
        text += possible.charAt((0, crypto_1.randomInt)(possible.length));
    }
    return text;
};
exports.makeSecureId = makeSecureId;
//# sourceMappingURL=make.secure.id.js.map