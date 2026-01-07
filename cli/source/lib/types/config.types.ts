// TODO: This will be changed - possibly generated types with orval (MAYBE)

export interface Config {
	llm?: {
		type?: 'cloud' | 'self-hosted';
		baseURL?: string;
		apiKey?: string;
	};
	chains?: {
		enabled?: string[];
		rpcUrls?: Record<string, string>;
	};
	apiKeys?: {
		codex?: string;
		[key: string]: any;
	};
}
