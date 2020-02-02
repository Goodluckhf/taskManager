import { AbstractRpcRequest } from '../../../lib/amqp/abstract-rpc-request';
import { VkUserCredentialsInterface } from '../vk-users/vk-user-credentials.interface';

export class FakeActivityRpcRequest extends AbstractRpcRequest {
	protected readonly method = 'fake_activity';

	protected readonly retriesLimit = 2;

	setArguments(args: { userCredentials: VkUserCredentialsInterface }) {
		this.args = args;
	}
}
