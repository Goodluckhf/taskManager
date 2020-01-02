import { Type } from 'class-transformer';
import { User } from '../../users/user';

export class AuthorizedResponseDto {
	@Type(() => User)
	user: User;

	token: string;
}
