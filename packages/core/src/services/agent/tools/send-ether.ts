import { tool } from 'ai';
import { Address, formatEther } from 'viem';
import { isAddress, isHash, parseEther } from 'viem/utils';
import { z } from 'zod';
import type { BlockchainService } from '../../blockchain.service.js';

const schema = {
	description: 'Send ether to a provider address',
	inputSchema: z.object({
		address: z
			.string()
			.refine(isAddress, 'Invalid Ethereum address')
			.describe('The address of the recipient'),
		amount: z.string().describe('The amount to send'),
	}),
	outputSchema: z.object({
		address: z.string().describe('The active wallet address'),
		newBalance: z.string().describe('New balance after transaction in ETH'),
		transactionHash: z
			.string()
			.refine(isHash, 'Invalid transaction hash')
			.describe('The transaction hash'),
	}),
};

export function sendEtherTool(blockchainService: BlockchainService) {
	return tool({
		...schema,
		needsApproval: true,
		execute: async ({ address, amount }) => {
			const wallet = blockchainService.getWalletClient();
			const amountWei = parseEther(amount);

			const hash = await wallet.sendTransaction({
				to: address,
				value: amountWei,
			});

			const newBalance = await blockchainService
				.getPublicClient()
				.getBalance({ address: wallet.account.address });

			return {
				address: wallet.account.address,
				newBalance: formatEther(newBalance),
				transactionHash: hash,
			};
		},
	});
}
