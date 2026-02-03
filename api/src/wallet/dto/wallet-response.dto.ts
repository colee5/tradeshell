import { ApiProperty } from '@nestjs/swagger';

export class WalletResponseDto {
	@ApiProperty({ example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' })
	address: string;
}
