"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiProvider = aiProvider;
exports.aiApiKeyEnv = aiApiKeyEnv;
exports.aiModelConfigured = aiModelConfigured;
exports.aiModelName = aiModelName;
exports.aiSdkModel = aiSdkModel;
exports.langchainModel = langchainModel;
const anthropic_1 = require("@ai-sdk/anthropic");
const google_1 = require("@ai-sdk/google");
const openai_1 = require("@ai-sdk/openai");
const anthropic_2 = require("@langchain/anthropic");
const google_genai_1 = require("@langchain/google-genai");
const openai_2 = require("@langchain/openai");
const providerKeys = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    google: 'GOOGLE_GENERATIVE_AI_API_KEY',
};
const providerDefaults = {
    anthropic: 'claude-sonnet-4-5',
    google: 'gemini-flash-latest',
    openai: 'gpt-4.1',
};
function aiProvider() {
    const provider = (process.env.AI_PROVIDER || 'openai');
    return provider in providerKeys ? provider : 'openai';
}
function aiApiKeyEnv() {
    return providerKeys[aiProvider()];
}
function aiModelConfigured() {
    const key = process.env[aiApiKeyEnv()];
    return !!key && key !== '';
}
function aiModelName(providerDefault) {
    if (process.env.AI_MODEL) {
        return process.env.AI_MODEL;
    }
    return aiProvider() === 'openai' ? providerDefault : providerDefaults[aiProvider()];
}
function aiSdkModel(providerDefault) {
    const model = aiModelName(providerDefault);
    switch (aiProvider()) {
        case 'anthropic':
            return (0, anthropic_1.anthropic)(model);
        case 'google':
            return (0, google_1.google)(model);
        default:
            return (0, openai_1.openai)(model);
    }
}
function langchainModel(providerDefault, temperature = 0.7) {
    const model = aiModelName(providerDefault);
    switch (aiProvider()) {
        case 'anthropic':
            return new anthropic_2.ChatAnthropic({
                apiKey: process.env.ANTHROPIC_API_KEY,
                model,
                temperature,
            });
        case 'google':
            return new google_genai_1.ChatGoogleGenerativeAI({
                apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
                model,
                temperature,
            });
        default:
            return new openai_2.ChatOpenAI({
                apiKey: process.env.OPENAI_API_KEY,
                model,
                temperature,
            });
    }
}
//# sourceMappingURL=ai.model.js.map