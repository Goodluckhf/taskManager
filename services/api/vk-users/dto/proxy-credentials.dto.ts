import { IsString } from 'class-validator';
import { ProxyInterface } from '../../proxies/proxy.interface';

export class ProxyCredentialsDto implements ProxyInterface {
	@IsString()
	login: string;

	@IsString()
	password: string;

	@IsString()
	url: string;
}
