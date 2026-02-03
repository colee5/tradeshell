import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEthereumAddress } from 'class-validator';

export class SetActiveWalletDto {
	@ApiProperty({ example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0' })
	@IsEthereumAddress()
	@Transform(({ value }) => value.toLowerCase())
	address: string;
}
