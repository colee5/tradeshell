import { ConfigDto } from './generated/types.gen.js';

export const isCommand = (cmd?: string) => {
	return cmd?.startsWith('/');
};

export const hasValidConfig = (config?: ConfigDto) => {
	return config && (config.llm || config.blockchain);
};
