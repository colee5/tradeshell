import { z } from 'zod';
import { LlmProvider } from '../../../../shared/llm-providers.js';

export const onboardingFormSchema = z.object({
	llmType: z.enum(['cloud', 'self-hosted']),
	provider: z.nativeEnum(LlmProvider).optional(),
	model: z.string().optional(),
	baseURL: z.string().optional(),
	apiKey: z.string().optional(),
});

export type OnboardingFormData = z.infer<typeof onboardingFormSchema>;
