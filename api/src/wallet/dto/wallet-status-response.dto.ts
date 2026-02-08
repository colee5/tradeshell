import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WalletStatusResponseDto {
	@ApiProperty({ example: true })
	isSetup: boolean;

	@ApiProperty({ example: true })
	isUnlocked: boolean;

	@ApiPropertyOptional({ example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' })
	activeAddress?: string | null;

	@ApiPropertyOptional({ example: 'Main Trading' })
	activeName?: string | null;

	@ApiProperty({ example: 2 })
	walletCount: number;
}
