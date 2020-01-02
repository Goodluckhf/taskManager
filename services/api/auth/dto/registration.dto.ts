import { IsEmail, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegistrationDto {
	@IsString()
	@IsEmail()
	@Transform(value => value.trim().toLowerCase())
	email: string;

	@IsString()
	password: string;
}
