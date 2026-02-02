import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChainNativeCurrencyDto {
	@ApiProperty({ example: 'Ether' })
	name: string;

	@ApiProperty({ example: 'ETH' })
	symbol: string;

	@ApiProperty({ example: 18 })
	decimals: number;
}

export class ChainBlockExplorerDto {
	@ApiProperty({ example: 'Basescan' })
	name: string;

	@ApiProperty({ example: 'https://basescan.org' })
	url: string;

	@ApiPropertyOptional({ example: 'https://api.basescan.org/api' })
	apiUrl?: string;
}

export class ChainRpcUrlsDto {
	@ApiProperty({ example: ['https://mainnet.base.org'], type: [String] })
	http: readonly string[];

	@ApiPropertyOptional({ example: ['wss://mainnet.base.org'], type: [String] })
	webSocket?: readonly string[];
}

export class ChainDto {
	@ApiProperty({ example: 8453, description: 'Chain ID in number form' })
	id: number;

	@ApiProperty({ example: 'Base', description: 'Human-readable chain name' })
	name: string;

	@ApiProperty({ type: ChainNativeCurrencyDto })
	nativeCurrency: ChainNativeCurrencyDto;

	@ApiProperty({ type: () => Object, description: 'Collection of RPC endpoints' })
	rpcUrls: {
		[key: string]: ChainRpcUrlsDto;
		default: ChainRpcUrlsDto;
	};

	@ApiPropertyOptional({ type: () => Object, description: 'Collection of block explorers' })
	blockExplorers?: {
		[key: string]: ChainBlockExplorerDto;
		default: ChainBlockExplorerDto;
	};

	@ApiPropertyOptional({ example: false })
	testnet?: boolean;

	@ApiPropertyOptional({ example: 1, description: 'Source Chain ID (L1 for L2s)' })
	sourceId?: number;
}

export class ChainsResponseDto {
	@ApiProperty({
		description: 'List of supported blockchain chains',
		type: [ChainDto],
	})
	chains: ChainDto[];
}
