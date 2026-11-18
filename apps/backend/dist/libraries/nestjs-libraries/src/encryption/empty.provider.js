"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyProvider = void 0;
class EmptyProvider {
    constructor() {
        this.name = 'no provider';
        this.validateEnvKeys = [];
    }
    async getKey() {
        throw new Error('No encryption provider found, set ENCRYPTION_PROVIDER to read the encrypted values');
    }
}
exports.EmptyProvider = EmptyProvider;
//# sourceMappingURL=empty.provider.js.map