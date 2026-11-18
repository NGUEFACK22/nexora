"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadFactory = void 0;
const cloudflare_storage_1 = require("./cloudflare.storage");
const local_storage_1 = require("./local.storage");
const runpod_media_processor_1 = require("./runpod.media.processor");
class UploadFactory {
    static createStorage() {
        const storageProvider = process.env.STORAGE_PROVIDER || 'local';
        switch (storageProvider) {
            case 'local':
                return new local_storage_1.LocalStorage(process.env.UPLOAD_DIRECTORY);
            case 'cloudflare':
                return new cloudflare_storage_1.CloudflareStorage(process.env.CLOUDFLARE_ACCOUNT_ID, process.env.CLOUDFLARE_ACCESS_KEY, process.env.CLOUDFLARE_SECRET_ACCESS_KEY, process.env.CLOUDFLARE_REGION, process.env.CLOUDFLARE_BUCKETNAME, process.env.CLOUDFLARE_BUCKET_URL);
            default:
                throw new Error(`Invalid storage type ${storageProvider}`);
        }
    }
    static processorEnabled() {
        return (process.env.STORAGE_PROVIDER === 'cloudflare' &&
            !!process.env.RUNPOD_API_KEY &&
            !!process.env.RUNPOD_ENDPOINT_ID);
    }
    static createProcessor() {
        if (!UploadFactory.processorEnabled()) {
            return null;
        }
        return new runpod_media_processor_1.RunPodMediaProcessor(process.env.RUNPOD_API_KEY, process.env.RUNPOD_ENDPOINT_ID);
    }
    static clippingEnabled() {
        return (process.env.STORAGE_PROVIDER === 'cloudflare' &&
            !!process.env.RUNPOD_API_KEY &&
            !!process.env.RUNPOD_INGEST_ENDPOINT_ID &&
            !!process.env.RUNPOD_CLIPPER_ENDPOINT_ID &&
            !!process.env.DEEPGRAM_API_KEY &&
            !!process.env.OPENAI_API_KEY);
    }
    static createIngestProcessor() {
        if (!UploadFactory.clippingEnabled()) {
            return null;
        }
        return new runpod_media_processor_1.RunPodMediaProcessor(process.env.RUNPOD_API_KEY, process.env.RUNPOD_INGEST_ENDPOINT_ID);
    }
    static createClipProcessor() {
        if (!UploadFactory.clippingEnabled()) {
            return null;
        }
        return new runpod_media_processor_1.RunPodMediaProcessor(process.env.RUNPOD_API_KEY, process.env.RUNPOD_CLIPPER_ENDPOINT_ID);
    }
}
exports.UploadFactory = UploadFactory;
//# sourceMappingURL=upload.factory.js.map