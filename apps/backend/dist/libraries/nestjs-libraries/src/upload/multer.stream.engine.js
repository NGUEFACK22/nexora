"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MulterStreamEngine = void 0;
exports.streamUploadOptions = streamUploadOptions;
const stream_1 = require("stream");
const upload_factory_1 = require("./upload.factory");
const custom_upload_validation_1 = require("./custom.upload.validation");
class MulterStreamEngine {
    constructor(storage) {
        this.storage = storage;
    }
    _handleFile(req, file, cb) {
        (0, custom_upload_validation_1.uploadStreamToStorage)(this.storage, stream_1.Readable.toWeb(file.stream)).then((uploaded) => {
            const safeBase = (file.originalname || 'upload')
                .replace(/\.[^./\\]*$/, '')
                .replace(/[\\/]/g, '_')
                .slice(0, 100) || 'upload';
            cb(null, {
                filename: uploaded.filename,
                path: uploaded.path,
                mimetype: uploaded.mimetype,
                originalname: `${safeBase}.${uploaded.ext}`,
            });
        }, (err) => cb(err));
    }
    _removeFile(req, file, cb) {
        this.storage.removeFile(file.path).then(() => cb(null), (err) => cb(err));
    }
}
exports.MulterStreamEngine = MulterStreamEngine;
let engine;
function streamUploadOptions() {
    engine = engine || new MulterStreamEngine(upload_factory_1.UploadFactory.createStorage());
    return {
        storage: engine,
        limits: { fileSize: (0, custom_upload_validation_1.getMaxSize)('video/mp4') + 1 },
    };
}
//# sourceMappingURL=multer.stream.engine.js.map