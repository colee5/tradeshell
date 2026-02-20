export enum LlmType {
	Cloud = 'cloud',
	SelfHosted = 'self-hosted',
}

export const LLM_TYPES = [LlmType.Cloud, LlmType.SelfHosted] as const;

export enum LlmProvider {
	Anthropic = 'anthropic',
	OpenAI = 'openai',
	Groq = 'groq',
}

export const LLM_MODELS: Record<LlmProvider, string[]> = {
	[LlmProvider.Anthropic]: [
		'claude-opus-4-6',
		'claude-sonnet-4-6',
		'claude-haiku-4-5-20251001',
		'claude-sonnet-4-5-20250929',
		'claude-opus-4-5-20251101',
	],
	[LlmProvider.OpenAI]: [
		'gpt-5.2',
		'gpt-5.2-pro',
		'gpt-5-mini',
		'gpt-5-nano',
		'gpt-4.1',
	],
	[LlmProvider.Groq]: [
		'llama-3.3-70b-versatile',
		'llama-3.1-8b-instant',
		'meta-llama/llama-4-maverick-17b-128e-instruct',
		'meta-llama/llama-4-scout-17b-16e-instruct',
		'qwen/qwen-3-32b',
	],
};
