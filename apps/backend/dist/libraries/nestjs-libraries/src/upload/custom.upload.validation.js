"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPLOAD_ALLOWED_MIME = void 0;
exports.getMaxSize = getMaxSize;
exports.maxSizeStream = maxSizeStream;
exports.uploadStreamToStorage = uploadStreamToStorage;
const common_1 = require("@nestjs/common");
const stream_1 = require("stream");
const { fileTypeStream } = require('file-type');
exports.UPLOAD_ALLOWED_MIME = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
    'image/bmp',
    'image/tiff',
    'video/mp4',
]);
function getMaxSize(mimeType) {
    if (mimeType.startsWith('image/')) {
        return 10 * 1024 * 1024;
    }
    else if (mimeType.startsWith('video/')) {
        return 1024 * 1024 * 1024;
    }
    else {
        throw new common_1.BadRequestException('Unsupported file type.');
    }
}
function maxSizeStream(maxSize) {
    let total = 0;
    return new stream_1.Transform({
        transform(chunk, _encoding, callback) {
            total += chunk.length;
            if (total > maxSize) {
                return callback(new common_1.BadRequestException('File is too large.'));
            }
            callback(null, chunk);
        },
    });
}
async function uploadStreamToStorage(storage, webStream, declaredSize = 0) {
    let sniffed;
    try {
        sniffed = await fileTypeStream(webStream);
    }
    catch (err) {
        throw new common_1.BadRequestException('Failed to read file', { cause: err });
    }
    const detected = sniffed.fileType;
    if (!detected || !exports.UPLOAD_ALLOWED_MIME.has(detected.mime)) {
        await sniffed.cancel();
        throw new common_1.BadRequestException('Unsupported file type.');
    }
    const maxSize = getMaxSize(detected.mime);
    if (declaredSize > maxSize) {
        await sniffed.cancel();
        throw new common_1.BadRequestException('File is too large.');
    }
    const body = (0, stream_1.pipeline)(stream_1.Readable.fromWeb(sniffed), maxSizeStream(maxSize), () => { });
    try {
        const uploaded = await storage.uploadStream(body, detected.mime, detected.ext);
        return { ...uploaded, ext: detected.ext };
    }
    catch (err) {
        body.destroy();
        throw err;
    }
}
//# sourceMappingURL=custom.upload.validation.js.map