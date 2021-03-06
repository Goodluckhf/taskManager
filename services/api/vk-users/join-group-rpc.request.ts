import { AbstractRpcRequest } from '../../../lib/amqp/abstract-rpc-request';
import { VkUserCredentialsInterface } from './vk-user-credentials.interface';

export class JoinGroupRpcRequest extends AbstractRpcRequest {
	protected readonly method = 'joinGroup';

	protected readonly retriesLimit = 3;

	protected priority = 2;

	setArguments(args: { userCredentials: VkUserCredentialsInterface; groupId: string }) {
		this.args = args;
	}
}
