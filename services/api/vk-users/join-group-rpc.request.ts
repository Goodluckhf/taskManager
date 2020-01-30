import { AbstractRpcRequest } from '../../../lib/amqp/abstract-rpc-request';
import { VkUserCredentialsInterface } from './vk-user-credentials.interface';
import { ProxyInterface } from '../proxies/proxy.interface';

export class JoinGroupRpcRequest extends AbstractRpcRequest {
	protected readonly method = 'joinGroup';

	protected readonly retriesLimit = 3;

	setArguments(args: { userCredentials: VkUserCredentialsInterface; groupId: string }) {
		this.args = args;
	}
}
