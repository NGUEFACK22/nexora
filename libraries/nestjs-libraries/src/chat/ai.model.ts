import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import type { MastraModelConfig } from '@mastra/core/llm';
import { ChatAnthropic } from '@langchain/anthropic';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';

export type AiProvider = 'openai' | 'anthropic' | 'google';

// every provider reads its own key, both for the Mastra agent (AI SDK reads it
// from the env itself) and for the CopilotKit adapters (same env names)
const providerKeys: Record<AiProvider, string> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  google: 'GOOGLE_GENERATIVE_AI_API_KEY',
};

const providerDefaults: Record<AiProvider, string> = {
  anthropic: 'claude-sonnet-4-5',
  google: 'gemini-flash-latest',
  openai: 'gpt-4.1',
};

// the requested provider, falling back to openai when unset or unknown
export function aiProvider(): AiProvider {
  const provider = (process.env.AI_PROVIDER || 'openai') as AiProvider;
  return provider in providerKeys ? provider : 'openai';
}

// env variable that must be set for the active provider to work
export function aiApiKeyEnv(): string {
  return providerKeys[aiProvider()];
}

// AI features must not start when the active provider has no key
export function aiModelConfigured(): boolean {
  const key = process.env[aiApiKeyEnv()];
  return !!key && key !== '';
}

// the model to use: AI_MODEL overrides everything, otherwise openai keeps the
// model each feature already used (providerDefault) and the other providers
// get their own sensible default
export function aiModelName(providerDefault: string): string {
  if (process.env.AI_MODEL) {
    return process.env.AI_MODEL;
  }
  return aiProvider() === 'openai' ? providerDefault : providerDefaults[aiProvider()];
}

// the Mastra / Vercel AI SDK model - the three provider packages are installed.
// The explicit return type keeps it portable: the inferred union would reference
// nested @ai-sdk/provider copies that differ per provider package (TS2742 on CI)
export function aiSdkModel(providerDefault: string): MastraModelConfig {
  const model = aiModelName(providerDefault);
  switch (aiProvider()) {
    case 'anthropic':
      return anthropic(model);
    case 'google':
      return google(model);
    default:
      return openai(model);
  }
}

// LangChain model for the LangGraph workflows, mirroring aiSdkModel(): every
// provider gets the key its package expects, passed explicitly (the ChatGoogle
// one would otherwise read GOOGLE_API_KEY instead of our validated variable)
export function langchainModel(
  providerDefault: string,
  temperature = 0.7
): BaseChatModel {
  const model = aiModelName(providerDefault);
  switch (aiProvider()) {
    case 'anthropic':
      return new ChatAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
        model,
        temperature,
      });
    case 'google':
      return new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        model,
        temperature,
      });
    default:
      return new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model,
        temperature,
      });
  }
}
