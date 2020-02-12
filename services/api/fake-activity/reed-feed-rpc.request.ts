import { AbstractRpcRequest } from '../../../lib/amqp/abstract-rpc-request';
import { VkUserCredentialsInterface } from '../vk-users/vk-user-credentials.interface';

type ReedFeedArgument = {
	userCredentials: VkUserCredentialsInterface;
	isSmart: boolean;
	commonFeed: boolean;
	recommend: boolean;
	scrollCount: number;
	skipPosts: number;
};

export class ReedFeedRpcRequest extends AbstractRpcRequest {
	protected readonly method = 'reed_feed';

	protected readonly retriesLimit = 1;

	setArguments(args: ReedFeedArgument) {
		this.args = args;
	}
}
