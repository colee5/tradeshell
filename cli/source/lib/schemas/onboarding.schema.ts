import { z } from 'zod';

export const onboardingFormSchema = z.object({
	llmType: z.enum(['cloud', 'self-hosted']),
	baseURL: z.string().url().optional().or(z.literal('')),
	apiKey: z.string().min(1, 'API key is required'),
});

export type OnboardingFormData = z.infer<typeof onboardingFormSchema>;
