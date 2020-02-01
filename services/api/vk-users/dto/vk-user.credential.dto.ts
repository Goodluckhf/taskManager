import { IsDefined, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { VkUserCredentialsInterface } from '../vk-user-credentials.interface';
import { ProxyCredentialsDto } from './proxy-credentials.dto';
import { ProxyInterface } from '../../proxies/proxy.interface';

export class VkUserCredentialDto implements VkUserCredentialsInterface {
	@IsString()
	login: string;

	@IsString()
	password: string;

	@Type(() => ProxyCredentialsDto)
	@IsDefined()
	@ValidateNested()
	proxy: ProxyInterface;
}
