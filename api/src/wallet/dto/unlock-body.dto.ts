import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UnlockBodyDto {
	@ApiProperty({ example: 'mypass' })
	@IsString()
	password: string;
}
