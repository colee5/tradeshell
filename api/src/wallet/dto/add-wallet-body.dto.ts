import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, Matches } from 'class-validator';
import { hashRegex } from '../../common/constants';

export class AddWalletBodyDto {
	@ApiProperty({
		example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
	})
	@IsString()
	@Matches(hashRegex, { message: 'Invalid private key format' })
	privateKey: string;

	@ApiProperty({ example: 'Main Trading' })
	@IsString()
	name: string;

	@ApiPropertyOptional({ example: true, default: true })
	@IsOptional()
	@IsBoolean()
	setActive?: boolean;
}
