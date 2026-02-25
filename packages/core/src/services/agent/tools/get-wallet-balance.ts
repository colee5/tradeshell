import { tool } from 'ai';
import { createPublicClient, formatEther, http } from 'viem';
import { z } from 'zod';
import { CHAIN_BY_ID, type ChainId } from '../../../constants/chains.js';
import type { BlockchainService } from '../../blockchain.service.js';

const schema = {
	description:
		'Get the native token balance of the active wallet. If no chainId is provided, uses the currently active chain.',
	inputSchema: z.object({
		chainId: z
			.number()
			.optional()
			.describe('Optional chain ID to check the balance on. If omitted, uses the active chain.'),
	}),
	outputSchema: z.object({
		address: z.string().describe('The active wallet address'),
		balance: z.string().describe('The balance in the native token'),
		chainName: z.string().describe('The chain the balance was checked on'),
	}),
};

export function getWalletBalanceTool(blockchainService: BlockchainService) {
	return tool({
		...schema,
		needsApproval: true,
		execute: async ({ chainId }) => {
			const address = blockchainService.getWalletClient().account.address;

			if (chainId) {
				const chain = CHAIN_BY_ID[chainId as ChainId];

				if (!chain) {
					throw new Error(`Unsupported chainId: ${chainId}`);
				}

				const client = createPublicClient({ chain, transport: http() });
				const balance = await client.getBalance({ address });

				return { address, balance: formatEther(balance), chainName: chain.name };
			}

			const publicClient = blockchainService.getPublicClient();
			const balance = await publicClient.getBalance({ address });
			const chainName = publicClient.chain?.name ?? 'Unknown';

			return { address, balance: formatEther(balance), chainName };
		},
	});
}
