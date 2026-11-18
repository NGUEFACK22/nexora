"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorage = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const promises_1 = require("stream/promises");
const webhook_url_validator_1 = require("../dtos/webhooks/webhook.url.validator");
const ssrf_safe_dispatcher_1 = require("../dtos/webhooks/ssrf.safe.dispatcher");
const data_url_1 = require("./data.url");
const { fileTypeFromBuffer } = require('file-type');
const LOCAL_STORAGE_ALLOWED_MIME = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
    'image/bmp',
    'image/tiff',
    'video/mp4',
    'audio/mpeg',
    'audio/mp4',
    'audio/wav',
    'audio/ogg',
]);
class LocalStorage {
    constructor(uploadDirectory) {
        this.uploadDirectory = uploadDirectory;
    }
    newFilePath(ext) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const innerPath = `/${year}/${month}/${day}`;
        const dir = `${this.uploadDirectory}${innerPath}`;
        (0, fs_1.mkdirSync)(dir, { recursive: true });
        const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
        const filename = `${randomName}.${ext}`;
        return {
            filename,
            filePath: `${dir}/${filename}`,
            path: process.env.FRONTEND_URL + '/uploads' + `${innerPath}/${filename}`,
        };
    }
    async uploadSimple(path) {
        const dataUrl = path.startsWith('data:') ? (0, data_url_1.parseDataUrl)(path) : null;
        let body;
        if (dataUrl) {
            body = dataUrl.buffer;
        }
        else {
            if (!(await (0, webhook_url_validator_1.isSafePublicHttpsUrl)(path))) {
                throw new Error('Unsafe URL');
            }
            const loadImage = await fetch(path, {
                dispatcher: ssrf_safe_dispatcher_1.ssrfSafeDispatcher,
            });
            body = Buffer.from(await loadImage.arrayBuffer());
        }
        const detected = await fileTypeFromBuffer(body);
        if (!detected || !LOCAL_STORAGE_ALLOWED_MIME.has(detected.mime)) {
            throw new Error('Unsupported file type.');
        }
        const { filePath, path: publicUrl } = this.newFilePath(detected.ext);
        (0, fs_1.writeFileSync)(filePath, body);
        return publicUrl;
    }
    async uploadFile(file) {
        try {
            const detected = await fileTypeFromBuffer(file.buffer);
            if (!detected || !LOCAL_STORAGE_ALLOWED_MIME.has(detected.mime)) {
                throw new Error('Unsupported file type.');
            }
            const safeMime = detected.mime;
            const { filename, filePath, path } = this.newFilePath(detected.ext);
            (0, fs_1.writeFileSync)(filePath, file.buffer);
            return {
                filename,
                path,
                mimetype: safeMime,
                originalname: filename,
            };
        }
        catch (err) {
            console.error('Error uploading file to Local Storage:', err);
            throw err;
        }
    }
    async uploadStream(stream, mimetype, ext) {
        try {
            if (!LOCAL_STORAGE_ALLOWED_MIME.has(mimetype)) {
                throw new Error('Unsupported file type.');
            }
            const { filename, filePath, path } = this.newFilePath(ext);
            try {
                await (0, promises_1.pipeline)(stream, (0, fs_1.createWriteStream)(filePath));
            }
            catch (err) {
                await this.removeFile(filePath).catch(() => { });
                throw err;
            }
            return {
                filename,
                path,
                mimetype,
                originalname: filename,
            };
        }
        catch (err) {
            console.error('Error streaming file to Local Storage:', err);
            throw err;
        }
    }
    async removeFile(filePath) {
        const publicPrefix = process.env.FRONTEND_URL + '/uploads';
        const base = (0, path_1.resolve)(String(this.uploadDirectory));
        const localPath = (0, path_1.resolve)(filePath.startsWith(publicPrefix)
            ? this.uploadDirectory + filePath.slice(publicPrefix.length)
            : filePath);
        if (!localPath.startsWith(base + path_1.sep)) {
            throw new Error('Unsafe file path');
        }
        return new Promise((resolve, reject) => {
            (0, fs_1.unlink)(localPath, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
}
exports.LocalStorage = LocalStorage;
//# sourceMappingURL=local.storage.js.map