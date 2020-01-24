import { AbstractRpcRequest } from '../../../../lib/amqp/abstract-rpc-request';
import { VkUserCredentialsInterface } from '../vk-user-credentials.interface';
import { ProxyInterface } from '../../proxies/proxy.interface';

export class CheckAccountRpcRequest extends AbstractRpcRequest {
	protected readonly method = 'checkVkUser';

	protected readonly retriesLimit = 3;

	setArguments(args: { userCredentials: VkUserCredentialsInterface; proxy: ProxyInterface }) {
		this.args = args;
	}
}
