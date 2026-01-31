import { arbitrum, base, Chain, mainnet, sepolia } from 'viem/chains';

export enum ChainId {
	ETH = 1,
	BASE = 8453,
	ARBITRUM = 42161,
	ETH_TESTNET = 11155111,
}

export const CHAIN_BY_ID: Record<ChainId, Chain> = {
	[ChainId.ETH]: mainnet,
	[ChainId.BASE]: base,
	[ChainId.ARBITRUM]: arbitrum,
	[ChainId.ETH_TESTNET]: sepolia,
};
