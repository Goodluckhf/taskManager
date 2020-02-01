import { Type } from 'class-transformer';
import { IsDefined } from 'class-validator';
import { VkUserCredentialsInterface } from '../vk-user-credentials.interface';
import { VkUserCredentialDto } from './vk-user.credential.dto';

export class TaskCreationDto {
	@Type(() => VkUserCredentialDto)
	@IsDefined()
	usersCredentials: VkUserCredentialsInterface[];
}
