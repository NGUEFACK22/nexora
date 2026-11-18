"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runWithContext = runWithContext;
exports.getContext = getContext;
exports.getAuth = getAuth;
exports.getRequestId = getRequestId;
exports.getRelay = getRelay;
const node_async_hooks_1 = require("node:async_hooks");
const als = new node_async_hooks_1.AsyncLocalStorage();
function runWithContext(ctx, fn) {
    return als.run(ctx, fn);
}
function getContext() {
    return als.getStore();
}
function getAuth() {
    return als.getStore()?.auth;
}
function getRequestId() {
    return als.getStore()?.requestId;
}
function getRelay() {
    return als.getStore()?.relay;
}
//# sourceMappingURL=async.storage.js.map