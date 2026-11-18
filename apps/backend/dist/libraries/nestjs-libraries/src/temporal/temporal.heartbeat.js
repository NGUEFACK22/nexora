"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withHeartbeat = exports.setHeartbeatDetails = void 0;
const activity_1 = require("@temporalio/activity");
const HEARTBEAT_INTERVAL = 15_000;
const DETAILS = Symbol.for('postiz.heartbeatDetails');
const readDetails = (ctx) => ctx[DETAILS];
const setHeartbeatDetails = (details) => {
    try {
        const ctx = activity_1.Context.current();
        ctx[DETAILS] = details;
    }
    catch (err) {
    }
};
exports.setHeartbeatDetails = setHeartbeatDetails;
const withHeartbeat = async (fn) => {
    try {
        const ctx = activity_1.Context.current();
        (0, exports.setHeartbeatDetails)(`${ctx.info?.activityType || 'activity'}: entered`);
    }
    catch (err) {
    }
    let logged = false;
    const interval = setInterval(() => {
        try {
            const ctx = activity_1.Context.current();
            ctx.heartbeat(readDetails(ctx));
        }
        catch (err) {
            if (!logged) {
                logged = true;
                console.error('withHeartbeat: heartbeat failed', err);
            }
        }
    }, HEARTBEAT_INTERVAL);
    try {
        return await fn();
    }
    finally {
        clearInterval(interval);
    }
};
exports.withHeartbeat = withHeartbeat;
//# sourceMappingURL=temporal.heartbeat.js.map