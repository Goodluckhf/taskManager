import { inject } from 'inversify';
import { getRandom } from '../../../lib/helper';
import { AbstractRpcRequest } from '../../../lib/amqp/abstract-rpc-request';
import { RpcRequestFactory } from '../../../lib/amqp/rpc-request.factory';
import { ReedFeedRpcRequest } from './reed-feed-rpc.request';
import { VkUserCredentialsInterface } from '../vk-users/vk-user-credentials.interface';

export class FakeActivityRandomizerFactory {
	@inject(RpcRequestFactory) private readonly rpcRequestFactory: RpcRequestFactory;

	getRandomTasks({
		userCredentials,
	}: {
		userCredentials: VkUserCredentialsInterface;
	}): AbstractRpcRequest[] {
		const taskRpcRequests: AbstractRpcRequest[] = [];

		const shouldReedFeed = getRandom(0, 100) > 50;
		if (shouldReedFeed) {
			taskRpcRequests.push(this.getFeedTask(userCredentials));
		}

		return taskRpcRequests;
	}

	getFeedTask(userCredentials: VkUserCredentialsInterface): AbstractRpcRequest {
		const scrollCount = getRandom(0, 20);
		const rpcRequestArgs = {
			userCredentials,
			isSmart: false,
			commonFeed: false,
			recommend: false,
			scrollCount,
		};
		const feedRpcRequest = this.rpcRequestFactory.create(ReedFeedRpcRequest);
		const shouldReedRecommended = getRandom(0, 100) > 70;
		if (shouldReedRecommended) {
			feedRpcRequest.setArguments({ ...rpcRequestArgs, recommend: true });
			return feedRpcRequest;
		}

		const shouldSwitchSmartFeed = getRandom(0, 100) > 50;
		if (shouldSwitchSmartFeed) {
			feedRpcRequest.setArguments({ ...rpcRequestArgs, isSmart: true });
		} else {
			feedRpcRequest.setArguments({ ...rpcRequestArgs, commonFeed: true });
		}

		return feedRpcRequest;
	}
}
