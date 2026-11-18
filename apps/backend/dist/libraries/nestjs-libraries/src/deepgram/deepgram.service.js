"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepgramService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
let DeepgramService = class DeepgramService {
    async transcribeUrl(url) {
        const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&utterances=true&detect_language=true&mip_opt_out=true', {
            method: 'POST',
            headers: {
                Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
            signal: AbortSignal.timeout(10 * 60 * 1000),
        });
        if (!response.ok) {
            throw new Error(`Deepgram ${response.status}: ${(await response.text()).slice(0, 500)}`);
        }
        const { results } = await response.json();
        const channel = results?.channels?.[0];
        return {
            version: 1,
            language: channel?.detected_language || 'en',
            origin: 'transcribed',
            word_level: true,
            segments: (results?.utterances || []).map((p) => ({
                start: p.start,
                end: p.end,
                text: p.transcript,
            })),
            words: (channel?.alternatives?.[0]?.words || []).map((p) => ({
                text: p.punctuated_word || p.word,
                start: p.start,
                end: p.end,
            })),
        };
    }
};
exports.DeepgramService = DeepgramService;
exports.DeepgramService = DeepgramService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], DeepgramService);
//# sourceMappingURL=deepgram.service.js.map