import { tool } from 'ai';
import { z } from 'zod';
import type { ConfigService } from '../../config.service.js';

const chainSchema = z.object({
	id: z.number().describe('The chain ID'),
	name: z.string().describe('The chain name'),
	isActive: z.boolean().describe('Whether this is the currently selected chain'),
});

const schema = {
	description: 'Get all supported blockchain chains and which one is currently selected.',
	inputSchema: z.object({}),
	outputSchema: z.object({
		chains: z.array(chainSchema).describe('List of supported chains'),
	}),
};

export function getSupportedChainsTool(configService: ConfigService) {
	return tool({
		...schema,
		execute: async () => {
			const [config, { chains }] = await Promise.all([
				configService.get(),
				Promise.resolve(configService.getChains()),
			]);

			const activeChainId = config?.blockchain?.chainId;

			return {
				chains: chains.map((chain) => ({
					id: chain.id,
					name: chain.name,
					isActive: chain.id === activeChainId,
				})),
			};
		},
	});
}
