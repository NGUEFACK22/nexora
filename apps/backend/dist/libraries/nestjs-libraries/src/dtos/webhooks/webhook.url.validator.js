"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsSafeWebhookUrlConstraint = void 0;
exports.isBlockedIPv4 = isBlockedIPv4;
exports.isBlockedIPv6 = isBlockedIPv6;
exports.isBlockedIp = isBlockedIp;
exports.isSafePublicHttpsUrl = isSafePublicHttpsUrl;
exports.IsSafeWebhookUrl = IsSafeWebhookUrl;
const class_validator_1 = require("class-validator");
const node_url_1 = require("node:url");
const promises_1 = __importDefault(require("node:dns/promises"));
const node_net_1 = __importDefault(require("node:net"));
const blockedIPv4Ranges = [
    ['0.0.0.0', 8],
    ['10.0.0.0', 8],
    ['127.0.0.0', 8],
    ['169.254.0.0', 16],
    ['172.16.0.0', 12],
    ['192.168.0.0', 16],
    ['100.64.0.0', 10],
    ['198.18.0.0', 15],
    ['224.0.0.0', 3],
];
const blockedIps = new node_net_1.default.BlockList();
for (const [address, prefix] of blockedIPv4Ranges) {
    blockedIps.addSubnet(address, prefix, 'ipv4');
    const [a, b, c, d] = address.split('.').map(Number);
    const high = ((a << 8) | b).toString(16);
    const low = ((c << 8) | d).toString(16);
    blockedIps.addSubnet(`64:ff9b::${high}:${low}`, 96 + prefix, 'ipv6');
    blockedIps.addSubnet(`2002:${high}:${low}::`, 16 + prefix, 'ipv6');
}
blockedIps.addSubnet('::', 96, 'ipv6');
blockedIps.addSubnet('fe80::', 10, 'ipv6');
blockedIps.addSubnet('fec0::', 10, 'ipv6');
blockedIps.addSubnet('fc00::', 7, 'ipv6');
blockedIps.addSubnet('ff00::', 8, 'ipv6');
function isBlockedIPv4(ip) {
    return node_net_1.default.isIPv4(ip) ? blockedIps.check(ip, 'ipv4') : true;
}
function isBlockedIPv6(ip) {
    return node_net_1.default.isIPv6(ip) ? blockedIps.check(ip, 'ipv6') : true;
}
function isBlockedIp(ip) {
    const version = node_net_1.default.isIP(ip);
    if (version === 4) {
        return isBlockedIPv4(ip);
    }
    if (version === 6) {
        return isBlockedIPv6(ip);
    }
    return true;
}
async function isSafePublicHttpsUrl(value) {
    if (typeof value !== 'string' || !value.trim()) {
        return false;
    }
    let parsed;
    try {
        parsed = new node_url_1.URL(value);
    }
    catch {
        return false;
    }
    if (parsed.protocol !== 'https:') {
        return false;
    }
    if (!parsed.hostname) {
        return false;
    }
    const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (hostname === 'localhost') {
        return false;
    }
    const literalIpVersion = node_net_1.default.isIP(hostname);
    if (literalIpVersion) {
        return !isBlockedIp(hostname);
    }
    try {
        const records = await promises_1.default.lookup(hostname, { all: true });
        if (!records.length) {
            return false;
        }
        for (const record of records) {
            if (isBlockedIp(record.address)) {
                return false;
            }
        }
        return true;
    }
    catch {
        return false;
    }
}
let IsSafeWebhookUrlConstraint = class IsSafeWebhookUrlConstraint {
    async validate(value, _args) {
        return isSafePublicHttpsUrl(value);
    }
    defaultMessage(_args) {
        return 'URL must be a public HTTPS URL and must not resolve to localhost, private, loopback, or link-local addresses';
    }
};
exports.IsSafeWebhookUrlConstraint = IsSafeWebhookUrlConstraint;
exports.IsSafeWebhookUrlConstraint = IsSafeWebhookUrlConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'IsSafeWebhookUrl', async: true })
], IsSafeWebhookUrlConstraint);
function IsSafeWebhookUrl(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsSafeWebhookUrlConstraint,
        });
    };
}
//# sourceMappingURL=webhook.url.validator.js.map