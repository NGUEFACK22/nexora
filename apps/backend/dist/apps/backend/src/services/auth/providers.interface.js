"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProviderAbstract = void 0;
exports.AuthProvider = AuthProvider;
const common_1 = require("@nestjs/common");
class AuthProviderAbstract {
    async postRegistration(providerToken, orgId) { }
}
exports.AuthProviderAbstract = AuthProviderAbstract;
function AuthProvider(params) {
    return function (target) {
        (0, common_1.Injectable)()(target);
        const existingMetadata = Reflect.getMetadata('auth-provider', AuthProviderAbstract) || [];
        existingMetadata.push({ target, provider: params.provider });
        Reflect.defineMetadata('auth-provider', existingMetadata, AuthProviderAbstract);
    };
}
//# sourceMappingURL=providers.interface.js.map