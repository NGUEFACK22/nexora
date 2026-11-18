"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalProvider = void 0;
class LocalProvider {
    constructor() {
        this.name = 'local';
        this.validateEnvKeys = ['ENCRYPTION_KEY'];
    }
    async getKey() {
        return Buffer.from(process.env.ENCRYPTION_KEY || '', 'base64');
    }
}
exports.LocalProvider = LocalProvider;
//# sourceMappingURL=local.provider.js.map