import { IsString } from 'class-validator';
import { prop } from '@typegoose/typegoose';
import { VkUserCredentialsInterface } from './vk-user-credentials.interface';

export class VkUserCredentialDto implements VkUserCredentialsInterface {
	@IsString()
	@prop()
	login: string;

	@IsString()
	@prop()
	password: string;
}
