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
		'claude-3-5-sonnet-20241022',
		'claude-3-5-haiku-20241022',
		'claude-3-opus-20240229',
		'claude-3-sonnet-20240229',
		'claude-3-haiku-20240307',
	],
	[LlmProvider.OpenAI]: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
	[LlmProvider.Groq]: [
		'llama-3.3-70b-versatile',
		'llama-3.1-70b-versatile',
		'llama-3.1-8b-instant',
		'mixtral-8x7b-32768',
	],
};
