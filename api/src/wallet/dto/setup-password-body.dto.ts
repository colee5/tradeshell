import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SetupPasswordBodyDto {
	@ApiProperty({ example: 'mypass', minLength: 4 })
	@IsString()
	@MinLength(4, { message: 'Password must be at least 4 characters long' })
	password: string;
}
