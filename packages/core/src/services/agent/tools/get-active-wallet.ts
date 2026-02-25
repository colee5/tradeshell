import { tool } from 'ai';
import { z } from 'zod';
import type { WalletService } from '../../wallet.service.js';

const schema = {
	description:
		'Get the currently active wallet address and name.',
	inputSchema: z.object({}),
	outputSchema: z.object({
		address: z.string().describe('The active wallet address'),
		name: z.string().describe('The active wallet name'),
	}),
};

export function getActiveWalletTool(walletService: WalletService) {
	return tool({
		...schema,
		execute: async () => {
			const { isUnlocked, activeAddress, activeName } = walletService.getStatus();

			if (!isUnlocked) {
				throw new Error('No wallet is currently unlocked.');
			}

			return { address: activeAddress!, name: activeName! };
		},
	});
}
