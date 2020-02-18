import { AbstractRpcRequest } from '../../../../lib/amqp/abstract-rpc-request';
import { VkUserCredentialsInterface } from '../vk-user-credentials.interface';

export class CheckAccountRpcRequest extends AbstractRpcRequest {
	protected readonly method = 'checkVkUser';

	protected readonly retriesLimit = 3;

	protected priority = 2;

	setArguments(args: { userCredentials: VkUserCredentialsInterface }) {
		this.args = args;
	}
}
