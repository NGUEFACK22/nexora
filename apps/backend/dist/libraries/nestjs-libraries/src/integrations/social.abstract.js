"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialAbstract = exports.NotEnoughScopes = exports.BadBody = exports.PublishedWithError = exports.Disconnect = exports.RefreshToken = exports.stripQuery = void 0;
exports.truncateForTemporal = truncateForTemporal;
exports.rangeReadFailure = rangeReadFailure;
const tslib_1 = require("tslib");
const timer_1 = require("@gitroom/helpers/utils/timer");
const activity_1 = require("@temporalio/activity");
const temporal_heartbeat_1 = require("@gitroom/nestjs-libraries/temporal/temporal.heartbeat");
const ssrf_safe_dispatcher_1 = require("@gitroom/nestjs-libraries/dtos/webhooks/ssrf.safe.dispatcher");
const sharp_1 = tslib_1.__importDefault(require("sharp"));
const fs_1 = require("fs");
const path_1 = require("path");
const stream_1 = require("stream");
const dashboard_function_decorator_1 = require("@gitroom/nestjs-libraries/integrations/dashboard.function.decorator");
const MEDIA_READ_TIMEOUT = 120_000;
const isReadTimeout = (err) => err?.name === 'TimeoutError' || err?.cause?.name === 'TimeoutError';
const stripQuery = (url) => {
    try {
        const parsed = new URL(url);
        return `${parsed.origin}${parsed.pathname}`;
    }
    catch (err) {
        return url.split('?')[0];
    }
};
exports.stripQuery = stripQuery;
const MAX_FAILURE_MESSAGE = 2_000;
const MAX_FAILURE_FIELD = 4_000;
function truncateForTemporal(value, max) {
    if (value === null || value === undefined) {
        return '';
    }
    const str = typeof value === 'string' ? value : safeStringify(value);
    if (str.length <= max) {
        return str;
    }
    return `${str.slice(0, max)}… [truncated ${str.length - max} chars]`;
}
class RefreshToken extends activity_1.ApplicationFailure {
    constructor(identifier, json, body, message = '') {
        super(truncateForTemporal(message, MAX_FAILURE_MESSAGE), 'refresh_token', true, [
            {
                identifier,
                json: truncateForTemporal(json, MAX_FAILURE_FIELD),
                body: truncateForTemporal(body, MAX_FAILURE_FIELD),
            },
        ]);
    }
}
exports.RefreshToken = RefreshToken;
class Disconnect extends activity_1.ApplicationFailure {
    constructor(identifier, json, body, message = '') {
        super(truncateForTemporal(message, MAX_FAILURE_MESSAGE), 'disconnect', true, [
            {
                identifier,
                json: truncateForTemporal(json, MAX_FAILURE_FIELD),
                body: truncateForTemporal(body, MAX_FAILURE_FIELD),
            },
        ]);
    }
}
exports.Disconnect = Disconnect;
class PublishedWithError extends activity_1.ApplicationFailure {
    constructor(identifier, postDbId, releaseId, releaseURL, message = '') {
        super(truncateForTemporal(message, MAX_FAILURE_MESSAGE), 'published_with_error', true, [{ identifier, postDbId, releaseId, releaseURL }]);
        this.postDbId = postDbId;
        this.releaseId = releaseId;
        this.releaseURL = releaseURL;
    }
}
exports.PublishedWithError = PublishedWithError;
function rangeReadFailure(response) {
    return JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
    });
}
class BadBody extends activity_1.ApplicationFailure {
    constructor(identifier, json, body, message = '') {
        super(truncateForTemporal(message, MAX_FAILURE_MESSAGE), 'bad_body', true, [
            {
                identifier,
                json: truncateForTemporal(json, MAX_FAILURE_FIELD),
                body: truncateForTemporal(body, MAX_FAILURE_FIELD),
            },
        ]);
    }
}
exports.BadBody = BadBody;
class NotEnoughScopes {
    constructor(message = 'Not enough scopes, when choosing a provider, please add all the scopes') {
        this.message = message;
    }
}
exports.NotEnoughScopes = NotEnoughScopes;
function safeStringify(obj) {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }
        return value;
    });
}
class SocialAbstract {
    constructor() {
        this.maxConcurrentJob = 1;
    }
    handleErrors(body, status) {
        return undefined;
    }
    migrationMatch(auth, integration) {
        return !!auth.username && auth.username === integration.profile;
    }
    async checkValidity(posts, settings, additionalSettings) {
        return true;
    }
    async checkPostStatus(accessToken, pendingData, integration) {
        throw new BadBody(this.identifier, '{"error":"checkPostStatus is not implemented for this provider"}', '{}', 'Unknown Error');
    }
    async finalizePost(accessToken, pendingData, integration) {
        throw new BadBody(this.identifier, '{"error":"finalizePost is not implemented for this provider"}', '{}', 'Unknown Error');
    }
    getSsrfSafeAxios() {
        return (0, ssrf_safe_dispatcher_1.getSsrfSafeAxios)();
    }
    assetBoolean(value) {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return value || false;
    }
    async getImageDimensions(path) {
        const url = path?.indexOf('http') === -1
            ? `${process.env.FRONTEND_URL}/${path}`
            : path;
        (0, temporal_heartbeat_1.setHeartbeatDetails)(`read media ${(0, exports.stripQuery)(url)}`);
        const { width = 0, height = 0 } = await (0, sharp_1.default)(await this.readOrFetch(url)).metadata();
        return { width, height };
    }
    async readOrFetch(path, retried = false) {
        if (path.indexOf('http') !== 0) {
            return (0, fs_1.readFileSync)(this.localMediaPath(path));
        }
        try {
            return (await this.getSsrfSafeAxios()({
                url: path,
                method: 'GET',
                responseType: 'arraybuffer',
                signal: AbortSignal.timeout(MEDIA_READ_TIMEOUT),
            })).data;
        }
        catch (err) {
            if (err?.code !== 'ERR_CANCELED' && !isReadTimeout(err)) {
                throw err;
            }
            if (!retried) {
                return this.readOrFetch(path, true);
            }
            throw new BadBody('', JSON.stringify({ timeoutMs: MEDIA_READ_TIMEOUT, path: (0, exports.stripQuery)(path) }), Buffer.from('{}'), 'We could not read the media for this post, so it was not published');
        }
    }
    async mediaSize(path, identifier = '') {
        if (path.indexOf('http') === 0) {
            (0, temporal_heartbeat_1.setHeartbeatDetails)(`media size ${(0, exports.stripQuery)(path)}`);
            const head = await fetch(path, {
                method: 'HEAD',
                headers: { 'accept-encoding': 'identity' },
                dispatcher: (0, ssrf_safe_dispatcher_1.getSsrfSafeDispatcher)(),
            });
            const length = Number(head.headers.get('content-length'));
            if (!head.ok || !Number.isFinite(length) || length <= 0) {
                throw new BadBody(identifier, '{}', Buffer.from('{}'), 'Could not determine the media size for upload');
            }
            return length;
        }
        return (0, fs_1.statSync)(this.localMediaPath(path, identifier)).size;
    }
    localMediaPath(path, identifier = '') {
        const base = process.env.UPLOAD_DIRECTORY
            ? (0, path_1.resolve)(process.env.UPLOAD_DIRECTORY)
            : '';
        const filePath = (0, path_1.resolve)(path);
        if (!base || !filePath.startsWith(base + path_1.sep)) {
            throw new BadBody(identifier, JSON.stringify({ path }), Buffer.from('{}'), 'The media for this post is not in the upload directory, so it was not published');
        }
        return filePath;
    }
    async mediaChunk(path, start, end, identifier = '', retried = false) {
        if (path.indexOf('http') === 0) {
            (0, temporal_heartbeat_1.setHeartbeatDetails)(`media chunk ${start}-${end} ${(0, exports.stripQuery)(path)}`);
            try {
                const response = await fetch(path, {
                    headers: {
                        Range: `bytes=${start}-${end}`,
                        'accept-encoding': 'identity',
                    },
                    dispatcher: (0, ssrf_safe_dispatcher_1.getSsrfSafeDispatcher)(),
                    signal: AbortSignal.timeout(MEDIA_READ_TIMEOUT),
                });
                if (response.status !== 206) {
                    await response.body?.cancel().catch(() => { });
                    throw new BadBody(identifier, rangeReadFailure(response), Buffer.from('{}'), `Media server did not honor the range request (status ${response.status})`);
                }
                return Buffer.from(await response.arrayBuffer());
            }
            catch (err) {
                if (!isReadTimeout(err)) {
                    throw err;
                }
                if (!retried) {
                    return this.mediaChunk(path, start, end, identifier, true);
                }
                throw new BadBody(identifier, JSON.stringify({ timeoutMs: MEDIA_READ_TIMEOUT, start, end }), Buffer.from('{}'), 'We could not read the media for this post, so it was not published');
            }
        }
        const filePath = this.localMediaPath(path, identifier);
        return new Promise((resolve, reject) => {
            const chunks = [];
            (0, fs_1.createReadStream)(filePath, { start, end })
                .on('data', (chunk) => chunks.push(chunk))
                .on('end', () => resolve(Buffer.concat(chunks)))
                .on('error', reject);
        });
    }
    async mediaStream(path, identifier = '') {
        if (path.indexOf('http') !== 0) {
            return (0, fs_1.createReadStream)(this.localMediaPath(path, identifier));
        }
        const response = await fetch(path, {
            headers: { 'accept-encoding': 'identity' },
            dispatcher: (0, ssrf_safe_dispatcher_1.getSsrfSafeDispatcher)(),
        });
        if (!response.ok || !response.body) {
            throw new BadBody(identifier, '{}', Buffer.from('{}'), 'Could not read the media for upload');
        }
        return stream_1.Readable.fromWeb(response.body);
    }
    async runStreamedUpload(func, identifier = '', totalRetries = 0) {
        try {
            return await func();
        }
        catch (err) {
            if (!err?.response) {
                throw err;
            }
            const status = err.response.status || 500;
            const data = err.response.data;
            const json = (typeof data === 'string' ? data : safeStringify(data || {})) || '{}';
            const handleError = this.handleErrors(json, status);
            if (totalRetries <= 2 &&
                (status === 429 ||
                    (status === 500 && !handleError) ||
                    handleError?.type === 'retry' ||
                    json.includes('rate_limit_exceeded') ||
                    json.includes('Rate limit'))) {
                await (0, timer_1.timer)(5000);
                return this.runStreamedUpload(func, identifier, totalRetries + 1);
            }
            if (handleError?.type === 'disconnect') {
                throw new Disconnect(identifier, json, '{}', handleError?.value);
            }
            if ((status === 401 &&
                (handleError?.type === 'refresh-token' || !handleError)) ||
                handleError?.type === 'refresh-token') {
                throw new RefreshToken(identifier, json, '{}', handleError?.value);
            }
            throw new BadBody(identifier, json, '{}', handleError?.value || 'Unknown Error');
        }
    }
    async mention(token, d, id, integration) {
        return { none: true };
    }
    async runInConcurrent(func, ignoreConcurrency) {
        let globalErr = {};
        let value;
        try {
            value = await func();
        }
        catch (err) {
            if (err instanceof BadBody ||
                err instanceof RefreshToken ||
                err instanceof Disconnect) {
                throw err;
            }
            const handle = this.handleErrors(safeStringify(err), 200);
            value = { err: true, value: 'Unknown Error', ...(handle || {}) };
            globalErr = err;
        }
        if (value && value?.err && value?.value) {
            if (value.type === 'refresh-token') {
                throw new RefreshToken('', safeStringify({}), {}, value.value || '');
            }
            if (value.type === 'disconnect') {
                throw new Disconnect('', safeStringify(globalErr), {}, value.value || '');
            }
            throw new BadBody('', safeStringify(globalErr), {}, value.value || '');
        }
        return value;
    }
    async fetch(url, options = {}, identifier = '', totalRetries = 0, ignoreConcurrency = false, message = '') {
        (0, temporal_heartbeat_1.setHeartbeatDetails)(`fetch ${(0, exports.stripQuery)(url)}`);
        const request = await fetch(url, {
            ...options,
            dispatcher: options.dispatcher ?? (0, ssrf_safe_dispatcher_1.getSsrfSafeDispatcher)(),
        });
        if (request.status === 200 || request.status === 201) {
            return request;
        }
        let json = '{}';
        try {
            json = await request.text();
        }
        catch (err) {
            json = '{}';
        }
        if (totalRetries > 2) {
            throw new BadBody(identifier, json, options.body || '{}', message);
        }
        const handleError = this.handleErrors(json || '{}', request.status);
        if (request.status === 429 ||
            (request.status === 500 && !handleError) ||
            json.includes('rate_limit_exceeded') ||
            json.includes('Rate limit')) {
            await (0, timer_1.timer)(5000);
            return this.fetch(url, options, identifier, totalRetries + 1, ignoreConcurrency, handleError?.value || 'Unknown Error');
        }
        if (handleError?.type === 'retry') {
            await (0, timer_1.timer)(5000);
            return this.fetch(url, options, identifier, totalRetries + 1, ignoreConcurrency, handleError?.value || 'Unknown Error');
        }
        if (handleError?.type === 'disconnect') {
            throw new Disconnect(identifier, json, options.body, handleError?.value);
        }
        if ((request.status === 401 &&
            (handleError?.type === 'refresh-token' || !handleError)) ||
            handleError?.type === 'refresh-token') {
            throw new RefreshToken(identifier, json, options.body, handleError?.value);
        }
        throw new BadBody(identifier, json, options.body, handleError?.value || 'Unknown Error');
    }
    checkScopes(required, got) {
        if (Array.isArray(got)) {
            if (!required.every((scope) => got.includes(scope))) {
                throw new NotEnoughScopes();
            }
            return true;
        }
        const newGot = decodeURIComponent(got);
        const splitType = newGot.indexOf(',') > -1 ? ',' : ' ';
        const gotArray = newGot.split(splitType);
        if (!required.every((scope) => gotArray.includes(scope))) {
            throw new NotEnoughScopes();
        }
        return true;
    }
}
exports.SocialAbstract = SocialAbstract;
tslib_1.__decorate([
    (0, dashboard_function_decorator_1.DashboardFunction)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], SocialAbstract.prototype, "mention", null);
//# sourceMappingURL=social.abstract.js.map