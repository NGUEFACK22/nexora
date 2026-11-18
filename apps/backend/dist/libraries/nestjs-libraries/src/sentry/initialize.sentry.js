"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSentry = exports.setSentryUserContext = void 0;
const Sentry = __importStar(require("@sentry/nestjs"));
const profiling_node_1 = require("@sentry/profiling-node");
const lodash_1 = require("lodash");
const setSentryUserContext = (params) => {
    try {
        Sentry.setUser(params.userId
            ? { id: params.userId, ...(params.email ? { email: params.email } : {}) }
            : null);
        if (params.orgId) {
            Sentry.setTag('organization.id', params.orgId);
        }
        if (params.paymentId?.startsWith('cus_')) {
            Sentry.setTag('stripe.customer_id', params.paymentId);
        }
    }
    catch (err) {
    }
};
exports.setSentryUserContext = setSentryUserContext;
const initializeSentry = (appName, allowLogs = false) => {
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
        return null;
    }
    try {
        Sentry.init({
            initialScope: {
                tags: {
                    service: appName,
                    component: 'nestjs',
                },
                contexts: {
                    app: {
                        name: `Nexora ${(0, lodash_1.capitalize)(appName)}`,
                    },
                },
            },
            environment: process.env.NODE_ENV || 'development',
            dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
            spotlight: process.env.SENTRY_SPOTLIGHT === '1',
            integrations: [
                (0, profiling_node_1.nodeProfilingIntegration)(),
                Sentry.consoleLoggingIntegration({ levels: ['log', 'info', 'warn', 'error', 'debug', 'assert', 'trace'] }),
                Sentry.openAIIntegration({
                    recordInputs: false,
                    recordOutputs: false,
                }),
            ],
            tracesSampler: ({ name, attributes, normalizedRequest, inheritOrSampleWith }) => {
                const path = String(normalizedRequest?.url || attributes?.['http.target'] || attributes?.['url.path'] || name || '');
                const method = String(normalizedRequest?.method || attributes?.['http.request.method'] || attributes?.['http.method'] || '');
                if (method === 'GET' && /^(https?:\/\/[^/]+)?\/mcp(\/|-oauth|\?|$)/.test(path)) {
                    return 0;
                }
                if (name?.startsWith('prisma:')) {
                    return 0;
                }
                return inheritOrSampleWith(path.includes('/public/v1/analytics/') ? 0.01 : 0.5);
            },
            ignoreSpans: [
                /^prisma:(client:serialize|engine:(query|serialize|response_json_serialization|connection))$/,
                { op: 'db', name: /^(BEGIN|COMMIT|DEALLOCATE ALL)$/ },
                { op: 'middleware.express' },
            ],
            enableLogs: true,
            profileSessionSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.4,
            profileLifecycle: 'trace',
        });
    }
    catch (err) {
        console.log(err);
    }
    return true;
};
exports.initializeSentry = initializeSentry;
//# sourceMappingURL=initialize.sentry.js.map