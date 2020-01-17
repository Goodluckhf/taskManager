import { Type } from 'class-transformer';
import { VkUserCredentialsInterface } from '../vk-user-credentials.interface';
import { VkUserCredentialDto } from './vk-user.credential.dto';

export class TaskCreationDto {
	@Type(() => VkUserCredentialDto)
	usersCredentials: VkUserCredentialsInterface[];
}
