import { tool } from 'ai';
import { formatEther } from 'viem';
import { isAddress, isHash, parseEther } from 'viem/utils';
import { z } from 'zod';
import type { BlockchainService } from '../../blockchain.service.js';
import { createLogger } from '../../logger.js';

const logger = createLogger('SendEther');

const schema = {
	description: 'Send ether to a provided address.',
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
		explorerUrl: z.string().nullable().describe('Block explorer URL for the transaction'),
	}),
};

export function sendEtherTool(blockchainService: BlockchainService) {
	return tool({
		...schema,
		needsApproval: true,
		async execute({ address, amount }) {
			const wallet = blockchainService.getWalletClient();
			const publicClient = blockchainService.getPublicClient();
			const amountWei = parseEther(amount);

			const hash = await wallet.sendTransaction({
				to: address,
				value: amountWei,
			});

			const newBalance = await publicClient.getBalance({ address: wallet.account.address });

			const result = {
				address: wallet.account.address,
				newBalance: formatEther(newBalance),
				transactionHash: hash,
				explorerUrl: blockchainService.getExplorerUrl(hash),
			};

			logger.log(`Sent ${amount} ETH to ${address} (tx: ${hash})`);

			return result;
		},
	});
}
