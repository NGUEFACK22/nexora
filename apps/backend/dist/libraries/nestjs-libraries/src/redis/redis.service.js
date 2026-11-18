"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ioRedis = void 0;
const ioredis_1 = require("ioredis");
class MockRedis {
    constructor() {
        this.data = new Map();
    }
    async get(key) {
        return this.data.get(key);
    }
    async set(key, value) {
        this.data.set(key, value);
        return 'OK';
    }
    async del(key) {
        this.data.delete(key);
        return 1;
    }
    async rpush(key, value) {
        this.data.set(key, [...(this.data.get(key) || []), value]);
        return this.data.get(key).length;
    }
    async lrange(key, start, end) {
        const list = this.data.get(key) || [];
        return list.slice(start, end === -1 ? undefined : end + 1);
    }
    async expire() {
        return 1;
    }
}
exports.ioRedis = process.env.REDIS_URL
    ? new ioredis_1.Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        connectTimeout: 10000,
    })
    : new MockRedis();
//# sourceMappingURL=redis.service.js.map