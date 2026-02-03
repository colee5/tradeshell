import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordBodyDto {
	@ApiProperty({ example: 'oldpass' })
	@IsString()
	oldPassword: string;

	@ApiProperty({ example: 'newpass', minLength: 4 })
	@IsString()
	@MinLength(4)
	newPassword: string;
}
