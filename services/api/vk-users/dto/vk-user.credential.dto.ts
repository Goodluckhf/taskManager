import { IsString } from 'class-validator';
import { prop } from '@typegoose/typegoose';
import { Type } from 'class-transformer';
import { VkUserCredentialsInterface } from '../vk-user-credentials.interface';
import { ProxyCredentialsDto } from './proxy-credentials.dto';
import { ProxyInterface } from '../../proxies/proxy.interface';

export class VkUserCredentialDto implements VkUserCredentialsInterface {
	@IsString()
	@prop()
	login: string;

	@IsString()
	@prop()
	password: string;

	@Type(() => ProxyCredentialsDto)
	proxy: ProxyInterface;
}
