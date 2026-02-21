import { tool } from 'ai';
import { formatEther } from 'viem';
import { z } from 'zod';
import type { BlockchainService } from '../../blockchain.service.js';

const schema = {
	description: 'Get the native token balance of the active wallet',
	inputSchema: z.object({}),
	outputSchema: z.object({
		address: z.string().describe('The active wallet address'),
		balance: z.string().describe('The balance in ETH'),
	}),
};

export function getWalletBalanceTool(blockchainService: BlockchainService) {
	return tool({
		...schema,
		execute: async () => {
			const address = blockchainService.getWalletClient().account.address;
			const balance = await blockchainService.getPublicClient().getBalance({ address });

			return { address, balance: formatEther(balance) };
		},
	});
}
