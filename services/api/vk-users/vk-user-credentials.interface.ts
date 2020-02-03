import { ProxyInterface } from '../proxies/proxy.interface';

export interface VkUserCredentialsInterface {
	login: string;
	password: string;
	proxy: ProxyInterface;
	remixsid?: string;
	userAgent?: string;
}
