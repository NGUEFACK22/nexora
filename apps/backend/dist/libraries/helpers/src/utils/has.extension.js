"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasExtension = void 0;
const hasExtension = (path, extension) => {
    if (!path) {
        return false;
    }
    const ext = extension.startsWith('.') ? extension : `.${extension}`;
    return path.toLowerCase().indexOf(ext.toLowerCase()) > -1;
};
exports.hasExtension = hasExtension;
//# sourceMappingURL=has.extension.js.map