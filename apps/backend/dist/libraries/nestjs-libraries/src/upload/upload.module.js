"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const upload_factory_1 = require("./upload.factory");
let UploadModule = class UploadModule {
};
exports.UploadModule = UploadModule;
exports.UploadModule = UploadModule = tslib_1.__decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [upload_factory_1.UploadFactory],
        exports: [upload_factory_1.UploadFactory],
    })
], UploadModule);
//# sourceMappingURL=upload.module.js.map