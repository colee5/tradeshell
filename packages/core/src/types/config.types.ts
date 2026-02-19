import { z } from 'zod';
import { ChainId } from '../constants/chains.js';
import { LlmType } from '../constants/llm.js';

export const llmConfigSchema = z.object({
	type: z.nativeEnum(LlmType).optional(),
	provider: z.string().optional(),
	model: z.string().optional(),
	baseURL: z.string().url().optional(),
	apiKey: z.string().optional(),
});

export const blockchainConfigSchema = z.object({
	chainId: z.nativeEnum(ChainId),
	rpcUrl: z.string().url().optional(),
});

export const configSchema = z.object({
	llm: llmConfigSchema.optional(),
	blockchain: blockchainConfigSchema.optional(),
});

// Client side schemas
export const blockchainOnboardingSchema = blockchainConfigSchema.extend({
	rpcUrl: z.string().url('Invalid URL'),
});

export const llmSelfHostedOnboardingSchema = llmConfigSchema.extend({
	baseURL: z.string().url('Invalid URL'),
});

export type LlmConfig = z.infer<typeof llmConfigSchema>;
export type BlockchainConfig = z.infer<typeof blockchainConfigSchema>;
export type Config = z.infer<typeof configSchema>;
