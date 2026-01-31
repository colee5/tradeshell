import { BlockchainConfigDto } from '../generated/types.gen.js';

export type ChainOption = {
	label: string;
	value: BlockchainConfigDto['chainId'];
};

export const CHAIN_OPTIONS: ChainOption[] = [
	{ label: 'Ethereum Mainnet', value: 1 },
	{ label: 'Base', value: 8453 },
	{ label: 'Arbitrum', value: 42161 },
	{ label: 'Sepolia (Testnet)', value: 11155111 },
];
