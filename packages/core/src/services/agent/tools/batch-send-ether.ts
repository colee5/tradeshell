import { tool } from 'ai';
import { formatEther } from 'viem';
import { isAddress, isHash, parseEther } from 'viem/utils';
import { z } from 'zod';
import type { BlockchainService } from '../../blockchain.service.js';

const recipientSchema = z.object({
	address: z
		.string()
		.refine(isAddress, 'Invalid Ethereum address')
		.describe('The address of the recipient'),
	amount: z.string().describe('The amount to send in ETH'),
});

const resultSchema = z.object({
	address: z.string().describe('The recipient address'),
	amount: z.string().describe('The amount sent in ETH'),
	transactionHash: z
		.string()
		.refine(isHash, 'Invalid transaction hash')
		.describe('The transaction hash'),
	explorerUrl: z.string().nullable().describe('Block explorer URL for the transaction'),
});

const schema = {
	description: 'Send ether to multiple addresses in sequence.',
	inputSchema: z.object({
		recipients: z.array(recipientSchema).min(1).describe('List of recipients and amounts'),
	}),
	outputSchema: z.object({
		senderAddress: z.string().describe('The sender wallet address'),
		results: z.array(resultSchema).describe('Transaction results for each recipient'),
		newBalance: z.string().describe('Final balance after all transactions in ETH'),
	}),
};

export function batchSendEtherTool(blockchainService: BlockchainService) {
	return tool({
		...schema,
		needsApproval: true,
		execute: async ({ recipients }) => {
			const wallet = blockchainService.getWalletClient();
			const results = [];

			for (const recipient of recipients) {
				const hash = await wallet.sendTransaction({
					to: recipient.address,
					value: parseEther(recipient.amount),
				});

				results.push({
					address: recipient.address,
					amount: recipient.amount,
					transactionHash: hash,
					explorerUrl: blockchainService.getExplorerUrl(hash),
				});
			}

			const newBalance = await blockchainService
				.getPublicClient()
				.getBalance({ address: wallet.account.address });

			return {
				senderAddress: wallet.account.address,
				results,
				newBalance: formatEther(newBalance),
			};
		},
	});
}
