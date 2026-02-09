import { ConfigDto } from './generated/types.gen.js';

export const isCommand = (cmd?: string) => {
	return cmd?.startsWith('/');
};

export const hasValidConfig = (config?: ConfigDto) => {
	return config && (config.llm || config.blockchain);
};

export const truncateAddress = (address?: string, maxLength = 8) => {
	return `${address?.slice(0, maxLength)}...${address?.slice(-maxLength)}`;
};
