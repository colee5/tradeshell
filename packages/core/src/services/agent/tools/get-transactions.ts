import { tool } from 'ai';
import { z } from 'zod';
import { isAddress } from 'viem/utils';
import type { TransactionService } from '../../transaction.service.js';
import type { WalletService } from '../../wallet.service.js';

const schema = {
	description: 'Get the saved transactions for the active wallet or a provided wallet address.',
	inputSchema: z.object({
		walletAddress: z
			.string()
			.refine(isAddress, 'Invalid Ethereum address')
			.optional()
			.describe('The wallet address to get transactions for. Defaults to the active wallet.'),
	}),
	outputSchema: z.object({
		walletAddress: z.string().describe('The wallet address'),
		transactions: z.array(z.any()).describe('List of saved transactions'),
		count: z.number().describe('Total number of transactions'),
	}),
};

export function getTransactionsTool(
	walletService: WalletService,
	transactionService: TransactionService,
) {
	return tool({
		...schema,
		execute: async ({ walletAddress }) => {
			const address = walletAddress ?? walletService.getStatus().activeAddress;

			if (!address) {
				throw new Error('No wallet address provided and no active wallet is unlocked.');
			}

			const transactions = await transactionService.getTransactions(address);

			return {
				walletAddress: address,
				transactions,
				count: transactions.length,
			};
		},
	});
}
