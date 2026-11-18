import type { MastraModelConfig } from '@mastra/core/llm';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
export type AiProvider = 'openai' | 'anthropic' | 'google';
export declare function aiProvider(): AiProvider;
export declare function aiApiKeyEnv(): string;
export declare function aiModelConfigured(): boolean;
export declare function aiModelName(providerDefault: string): string;
export declare function aiSdkModel(providerDefault: string): MastraModelConfig;
export declare function langchainModel(providerDefault: string, temperature?: number): BaseChatModel;
