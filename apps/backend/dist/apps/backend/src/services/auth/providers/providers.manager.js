"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProviderManager = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const providers_interface_1 = require("@gitroom/backend/services/auth/providers.interface");
let AuthProviderManager = class AuthProviderManager {
    constructor(_moduleRef) {
        this._moduleRef = _moduleRef;
    }
    getProvider(provider) {
        const metadata = Reflect.getMetadata('auth-provider', providers_interface_1.AuthProviderAbstract) || [];
        const found = metadata.find((m) => m.provider === provider);
        if (!found) {
            throw new Error(`Auth provider ${provider} not found`);
        }
        return this._moduleRef.get(found.target, { strict: false });
    }
};
exports.AuthProviderManager = AuthProviderManager;
exports.AuthProviderManager = AuthProviderManager = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [core_1.ModuleRef])
], AuthProviderManager);
//# sourceMappingURL=providers.manager.js.map