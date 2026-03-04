import { formatEther } from 'viem';
import { parseEther } from 'viem/utils';
import { SimulationType, type SimulationResult } from '../../../types/simulation.types.js';
import { extractSimulationError } from '../../../utils/simulation.utils.js';
import type { BlockchainService } from '../../blockchain.service.js';
import { createLogger } from '../../logger.js';

const logger = createLogger('Simulations');

type SimulateFn = (args: Record<string, unknown>) => Promise<SimulationResult>;

export function createSimulations(
	blockchainService: BlockchainService,
): Record<string, SimulateFn> {
	return {
		async sendEther({ address, amount }) {
			try {
				const wallet = blockchainService.getWalletClient();
				const publicClient = blockchainService.getPublicClient();
				const amountWei = parseEther(amount as string);

				const [gasEstimate, gasPrice] = await Promise.all([
					publicClient.estimateGas({
						account: wallet.account,
						to: address as `0x${string}`,
						value: amountWei,
					}),
					publicClient.getGasPrice(),
				]);

				return {
					type: SimulationType.GAS,
					gasEstimate: gasEstimate.toString(),
					gasPrice: formatEther(gasPrice),
					estimatedCost: formatEther(gasEstimate * gasPrice),
				};
			} catch (error) {
				logger.error('sendEther simulation failed', error);
				return extractSimulationError(error);
			}
		},

		async batchSendEther({ recipients }) {
			try {
				const wallet = blockchainService.getWalletClient();
				const publicClient = blockchainService.getPublicClient();
				const typedRecipients = recipients as Array<{ address: string; amount: string }>;

				let totalGasCost = 0n;
				const gasPrice = await publicClient.getGasPrice();

				for (const recipient of typedRecipients) {
					const gasEstimate = await publicClient.estimateGas({
						account: wallet.account,
						to: recipient.address as `0x${string}`,
						value: parseEther(recipient.amount),
					});
					totalGasCost += gasEstimate * gasPrice;
				}

				return {
					type: SimulationType.BATCH_GAS,
					recipients: String(typedRecipients.length),
					gasPrice: formatEther(gasPrice),
					estimatedTotalCost: formatEther(totalGasCost),
				};
			} catch (error) {
				logger.error('batchSendEther simulation failed', error);
				return extractSimulationError(error);
			}
		},

		async bridgeEther({ amount }) {
			try {
				const wallet = blockchainService.getWalletClient();
				const publicClient = blockchainService.getPublicClient();
				const fromAmount = parseEther(amount as string);

				const gasEstimate = await publicClient.estimateGas({
					account: wallet.account,
					to: wallet.account.address,
					value: fromAmount,
				});
				const gasPrice = await publicClient.getGasPrice();

				return {
					type: SimulationType.BRIDGE,
					gasEstimate: gasEstimate.toString(),
					gasPrice: formatEther(gasPrice),
					estimatedGasCost: formatEther(gasEstimate * gasPrice),
				};
			} catch (error) {
				logger.error('bridgeEther simulation failed', error);
				return extractSimulationError(error);
			}
		},
	};
}
