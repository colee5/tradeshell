import { z } from 'zod';
import { ChainId } from '../constants/chains.js';

export const llmConfigSchema = z.object({
	type: z.enum(['cloud', 'self-hosted']).optional(),
	provider: z.string().optional(),
	model: z.string().optional(),
	baseURL: z.string().optional(),
	apiKey: z.string().optional(),
});

export const blockchainConfigSchema = z.object({
	chainId: z.nativeEnum(ChainId),
	rpcUrl: z.string().optional(),
});

export const configSchema = z.object({
	llm: llmConfigSchema.optional(),
	blockchain: blockchainConfigSchema.optional(),
});

export type LlmConfig = z.infer<typeof llmConfigSchema>;
export type BlockchainConfig = z.infer<typeof blockchainConfigSchema>;
export type Config = z.infer<typeof configSchema>;
