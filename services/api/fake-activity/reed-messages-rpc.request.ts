import { AbstractRpcRequest } from '../../../lib/amqp/abstract-rpc-request';
import { VkUserCredentialsInterface } from '../vk-users/vk-user-credentials.interface';

type ReedMessageArgument = {
	userCredentials: VkUserCredentialsInterface;
};

export class ReedMessagesRpcRequest extends AbstractRpcRequest {
	protected readonly method = 'reed_messages';

	protected readonly retriesLimit = 2;

	setArguments(args: ReedMessageArgument) {
		this.args = args;
	}
}
