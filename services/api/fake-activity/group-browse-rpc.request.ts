import { AbstractRpcRequest } from '../../../lib/amqp/abstract-rpc-request';
import { VkUserCredentialsInterface } from '../vk-users/vk-user-credentials.interface';

type GroupBrowseArgument = {
	userCredentials: VkUserCredentialsInterface;
	isPopular: boolean;
	isCommon: boolean;
	shouldChangeCategory: boolean;
	shouldGotoGroup: boolean;
	scrollCount: number;
};

export class GroupBrowseRpcRequest extends AbstractRpcRequest {
	protected readonly method = 'browse_groups';

	protected readonly retriesLimit = 2;

	setArguments(args: GroupBrowseArgument) {
		this.args = args;
	}
}
