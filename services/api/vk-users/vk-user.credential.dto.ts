import { IsString } from 'class-validator';
import { VkUserCredentialsInterface } from './vk-user-credentials.interface';

export class VkUserCredentialDto implements VkUserCredentialsInterface {
	@IsString()
	login: string;

	@IsString()
	password: string;
}
