"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunPodMediaProcessor = void 0;
class RunPodMediaProcessor {
    constructor(_apiKey, endpointId) {
        this._apiKey = _apiKey;
        this._baseUrl = `${process.env.RUNPOD_API_URL || 'https://api.runpod.ai/v2'}/${endpointId}`;
    }
    async request(path, init) {
        const response = await fetch(`${this._baseUrl}${path}`, {
            ...init,
            headers: {
                Authorization: `Bearer ${this._apiKey}`,
                'Content-Type': 'application/json',
                ...(init?.headers || {}),
            },
            signal: AbortSignal.timeout(30000),
        });
        if (!response.ok) {
            throw new Error(`RunPod ${response.status}: ${(await response.text()).slice(0, 500)}`);
        }
        return response.json();
    }
    async submit(job) {
        const { id } = await this.request('/run', {
            method: 'POST',
            body: JSON.stringify({ input: job }),
        });
        if (!id) {
            throw new Error('RunPod accepted the job without returning an id');
        }
        return id;
    }
    async status(jobId) {
        const { status, output, error } = await this.request(`/status/${jobId}`, {
            method: 'GET',
        });
        switch (status) {
            case 'COMPLETED':
                return { status: 'completed', result: output };
            case 'FAILED':
            case 'CANCELLED':
            case 'TIMED_OUT':
                return { status: 'failed', error: error || status };
            default:
                return { status: 'pending' };
        }
    }
}
exports.RunPodMediaProcessor = RunPodMediaProcessor;
//# sourceMappingURL=runpod.media.processor.js.map