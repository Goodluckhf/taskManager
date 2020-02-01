import { IsString, MinLength } from 'class-validator';
import { ProxyInterface } from '../../proxies/proxy.interface';

export class ProxyCredentialsDto implements ProxyInterface {
	@IsString()
	@MinLength(1)
	login: string;

	@IsString()
	@MinLength(1)
	password: string;

	@IsString()
	@MinLength(1)
	url: string;
}
