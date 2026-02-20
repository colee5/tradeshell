import { createAnthropic } from '@ai-sdk/anthropic';
import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';
import { LlmProvider } from '../../constants/llm.js';
import type { LlmConfig } from '../../types/config.types.js';

export function createModel(config: LlmConfig): LanguageModel {
	const provider = config.provider;
	const modelId = config.model!;

	switch (provider) {
		case LlmProvider.Anthropic: {
			const anthropic = createAnthropic({
				apiKey: config.apiKey,
				baseURL: config.baseURL,
			});
			return anthropic(modelId);
		}

		case LlmProvider.OpenAI: {
			const openai = createOpenAI({
				apiKey: config.apiKey,
				baseURL: config.baseURL,
			});
			return openai(modelId);
		}

		case LlmProvider.Groq: {
			const groq = createGroq({
				apiKey: config.apiKey,
				baseURL: config.baseURL,
			});
			return groq(modelId);
		}

		default: {
			throw new Error(`Unsupported LLM provider: ${provider}`);
		}
	}
}
