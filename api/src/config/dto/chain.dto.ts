import { ApiProperty } from '@nestjs/swagger';
import { Chain } from 'viem';

export class ChainsResponseDto {
	@ApiProperty({
		description: 'List of supported blockchain chains',
		example: [
			{
				id: 8453,
				name: 'Base',
				nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
				rpcUrls: {
					default: { http: ['https://mainnet.base.org'] },
				},
				blockExplorers: {
					default: { name: 'Basescan', url: 'https://basescan.org' },
				},
				testnet: false,
			},
		],
	})
	chains: Chain[];
}
