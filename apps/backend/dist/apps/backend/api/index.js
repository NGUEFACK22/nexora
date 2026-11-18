"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const tslib_1 = require("tslib");
process.env.SERVERLESS = 'true';
const serverless_http_1 = tslib_1.__importDefault(require("serverless-http"));
let cached;
async function handler(req, res) {
    cached = cached || (0, serverless_http_1.default)(await boot());
    return cached(req, res);
}
async function boot() {
    const { createNestApp } = await Promise.resolve().then(() => tslib_1.__importStar(require('../dist/apps/backend/src/main.js')));
    const nest = await createNestApp();
    await nest.init();
    return nest.getHttpAdapter().getInstance();
}
//# sourceMappingURL=index.js.map