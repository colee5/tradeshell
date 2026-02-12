import type { Config } from '@tradeshell/core';

export const isCommand = (cmd?: string) => {
	return cmd?.startsWith('/');
};

export const hasValidConfig = (config?: Config) => {
	return config && (config.llm || config.blockchain);
};

export const truncateAddress = (address?: string, maxLength = 8) => {
	return `${address?.slice(0, maxLength)}...${address?.slice(-maxLength)}`;
};

export const nextEntryId = (() => {
	let counter = 0;

	return () => `entry-${++counter}`;
})();
