import { AbstractRpcRequest } from '../../../lib/amqp/abstract-rpc-request';
import { VkUserCredentialsInterface } from '../vk-users/vk-user-credentials.interface';

type GroupFeedBrowseArgument = {
	userCredentials: VkUserCredentialsInterface;
	scrollCount: number;
	groupLink: string;
};

export class GroupFeedBrowseRpcRequest extends AbstractRpcRequest {
	protected readonly method = 'browse_feed_group';

	protected readonly retriesLimit = 2;

	setArguments(args: GroupFeedBrowseArgument) {
		this.args = args;
	}
}
