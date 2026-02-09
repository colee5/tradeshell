import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CheckPasswordBodyDto {
	@ApiProperty({ example: 'mypass' })
	@IsString()
	password: string;
}
