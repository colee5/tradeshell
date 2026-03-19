import { arbitrum, base, type Chain, mainnet, sepolia, tempo } from 'viem/chains';

export type { Chain } from 'viem/chains';

export type SerializableChain = Pick<
	Chain,
	'id' | 'name' | 'nativeCurrency' | 'rpcUrls' | 'blockExplorers'
>;

export enum ChainId {
	ETH = mainnet.id,
	BASE = base.id,
	TEMPO = tempo.id,
	ARBITRUM = arbitrum.id,
	ETH_TESTNET = sepolia.id,
}

export const CHAIN_BY_ID: Record<ChainId, Chain> = {
	[ChainId.ETH]: mainnet,
	[ChainId.BASE]: base,
	[ChainId.TEMPO]: tempo,
	[ChainId.ARBITRUM]: arbitrum,
	[ChainId.ETH_TESTNET]: sepolia,
};
