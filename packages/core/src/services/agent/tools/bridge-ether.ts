import { tool } from 'ai';
import { formatEther, type Hex } from 'viem';
import { isHash, parseEther } from 'viem/utils';
import { z } from 'zod';
import { CHAIN_BY_ID, ChainId } from '../../../constants/chains.js';
import type { BlockchainService } from '../../blockchain.service.js';

const LIFI_API = 'https://li.quest/v1';
const NATIVE_TOKEN = '0x0000000000000000000000000000000000000000';

const supportedChainIds = Object.values(ChainId).filter((v): v is number => typeof v === 'number');

const schema = {
	description: 'Bridge native ETH from the current chain to another supported chain using LI.FI',
	inputSchema: z.object({
		toChainId: z
			.number()
			.refine(
				(id) => supportedChainIds.includes(id),
				`Unsupported chain. Supported: ${supportedChainIds.join(', ')}`,
			)
			.describe('The destination chain ID'),
		amount: z.string().describe('The amount of ETH to bridge'),
	}),
	outputSchema: z.object({
		fromChain: z.string().describe('Source chain name'),
		toChain: z.string().describe('Destination chain name'),
		amount: z.string().describe('Amount bridged in ETH'),
		estimatedReceived: z.string().describe('Estimated amount received in ETH'),
		bridgeTool: z.string().describe('Bridge/route used by LI.FI'),
		estimatedDuration: z.number().describe('Estimated bridge duration in seconds'),
		transactionHash: z
			.string()
			.refine(isHash, 'Invalid transaction hash')
			.describe('The transaction hash'),
		explorerUrl: z.string().nullable().describe('Block explorer URL for the transaction'),
	}),
};

type LifiQuoteResponse = {
	estimate: {
		toAmount: string;
		executionDuration: number;
	};
	tool: string;
	transactionRequest: {
		to: Hex;
		data: Hex;
		value: string;
		gasLimit: string;
	};
};

export function bridgeEtherTool(blockchainService: BlockchainService) {
	return tool({
		...schema,
		needsApproval: true,
		execute: async ({ toChainId, amount }) => {
			const wallet = blockchainService.getWalletClient();
			const fromChainId = wallet.chain.id;

			if (fromChainId === toChainId) {
				throw new Error('Source and destination chain must be different');
			}

			const fromAmount = parseEther(amount).toString();

			const params = new URLSearchParams({
				fromChain: String(fromChainId),
				toChain: String(toChainId),
				fromToken: NATIVE_TOKEN,
				toToken: NATIVE_TOKEN,
				fromAmount,
				fromAddress: wallet.account.address,
			});

			const response = await fetch(`${LIFI_API}/quote?${params.toString()}`);

			if (!response.ok) {
				const error = (await response.json()) as { message?: string };
				throw new Error(`LI.FI quote failed: ${error.message ?? response.statusText}`);
			}

			const quote = (await response.json()) as LifiQuoteResponse;

			const hash = await wallet.sendTransaction({
				to: quote.transactionRequest.to,
				data: quote.transactionRequest.data,
				value: BigInt(quote.transactionRequest.value),
				gas: quote.transactionRequest.gasLimit
					? BigInt(quote.transactionRequest.gasLimit)
					: undefined,
			});

			const fromChain = CHAIN_BY_ID[fromChainId as ChainId];
			const toChain = CHAIN_BY_ID[toChainId as ChainId];

			return {
				fromChain: fromChain?.name ?? String(fromChainId),
				toChain: toChain?.name ?? String(toChainId),
				amount,
				estimatedReceived: formatEther(BigInt(quote.estimate.toAmount)),
				bridgeTool: quote.tool,
				estimatedDuration: quote.estimate.executionDuration,
				transactionHash: hash,
				explorerUrl: blockchainService.getExplorerUrl(hash),
			};
		},
	});
}
