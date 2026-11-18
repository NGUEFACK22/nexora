"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ssrfSafeDispatcher = void 0;
exports.getSsrfSafeDispatcher = getSsrfSafeDispatcher;
exports.getSsrfSafeAxios = getSsrfSafeAxios;
const tslib_1 = require("tslib");
const undici_1 = require("undici");
const axios_1 = tslib_1.__importDefault(require("axios"));
const node_dns_1 = tslib_1.__importDefault(require("node:dns"));
const node_net_1 = tslib_1.__importDefault(require("node:net"));
const node_http_1 = tslib_1.__importDefault(require("node:http"));
const node_https_1 = tslib_1.__importDefault(require("node:https"));
const webhook_url_validator_1 = require("./webhook.url.validator");
function ssrfSafeLookup(hostname, options, callback) {
    if (node_net_1.default.isIP(hostname)) {
        const family = node_net_1.default.isIP(hostname);
        if ((0, webhook_url_validator_1.isBlockedIp)(hostname)) {
            return callback(new Error('Blocked IP'), '', 0);
        }
        return options && options.all
            ? callback(null, [{ address: hostname, family }], family)
            : callback(null, hostname, family);
    }
    node_dns_1.default.lookup(hostname, options, (err, address, family) => {
        if (err)
            return callback(err, '', 0);
        if (Array.isArray(address)) {
            for (const entry of address) {
                if ((0, webhook_url_validator_1.isBlockedIp)(entry.address)) {
                    return callback(new Error('Blocked IP'), '', 0);
                }
            }
            return callback(null, address, 0);
        }
        if ((0, webhook_url_validator_1.isBlockedIp)(address)) {
            return callback(new Error('Blocked IP'), '', 0);
        }
        callback(null, address, family);
    });
}
exports.ssrfSafeDispatcher = new undici_1.Agent({
    connect: {
        lookup: ssrfSafeLookup,
    },
});
const ssrfSafeAxios = axios_1.default.create({
    httpAgent: new node_http_1.default.Agent({ lookup: ssrfSafeLookup }),
    httpsAgent: new node_https_1.default.Agent({
        lookup: ssrfSafeLookup,
    }),
});
function getSsrfSafeDispatcher() {
    return process.env.DISABLE_SSRF_PROTECTION === 'true'
        ? undefined
        : exports.ssrfSafeDispatcher;
}
function getSsrfSafeAxios() {
    return process.env.DISABLE_SSRF_PROTECTION === 'true' ? axios_1.default : ssrfSafeAxios;
}
//# sourceMappingURL=ssrf.safe.dispatcher.js.map