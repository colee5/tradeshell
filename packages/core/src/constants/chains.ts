import { arbitrum, base, type Chain, mainnet, sepolia } from 'viem/chains';

export type { Chain } from 'viem/chains';

export type SerializableChain = Pick<Chain, 'id' | 'name' | 'nativeCurrency' | 'rpcUrls' | 'blockExplorers'>;

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
