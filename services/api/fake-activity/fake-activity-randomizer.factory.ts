import { inject } from 'inversify';
import { getRandom, hrefByGroupId } from '../../../lib/helper';
import { AbstractRpcRequest } from '../../../lib/amqp/abstract-rpc-request';
import { RpcRequestFactory } from '../../../lib/amqp/rpc-request.factory';
import { ReedFeedRpcRequest } from './reed-feed-rpc.request';
import { VkUserCredentialsInterface } from '../vk-users/vk-user-credentials.interface';
import { ReedMessagesRpcRequest } from './reed-messages-rpc.request';
import { GroupBrowseRpcRequest } from './group-browse-rpc.request';
import { VkUserService } from '../vk-users/vk-user.service';
import { GroupFeedBrowseRpcRequest } from './group-feed-browse-rpc.request';

export class FakeActivityRandomizerFactory {
	@inject(RpcRequestFactory) private readonly rpcRequestFactory: RpcRequestFactory;

	@inject(VkUserService) private readonly vkUserService: VkUserService;

	async getRandomTasks({
		userCredentials,
	}: {
		userCredentials: VkUserCredentialsInterface;
	}): Promise<AbstractRpcRequest[]> {
		const taskRpcRequests: AbstractRpcRequest[] = [];

		const randomNumber = getRandom(0, 100);
		if (randomNumber) {
			taskRpcRequests.push(this.getFeedTask(userCredentials));
		} else if (randomNumber < 70) {
			taskRpcRequests.push(this.getMessageTask(userCredentials));
		} else {
			taskRpcRequests.push(this.getGroupTask(userCredentials));
		}

		if (randomNumber > 50) {
			const rpcRequest = await this.getGroupFeedTask(userCredentials);
			if (rpcRequest) {
				taskRpcRequests.push(rpcRequest);
			}
		}

		return taskRpcRequests;
	}

	async getGroupFeedTask(
		userCredentials: VkUserCredentialsInterface,
	): Promise<AbstractRpcRequest | null> {
		const scrollCount = getRandom(0, 20);
		const vkUser = await this.vkUserService.getCredentialsByLogin(userCredentials.login);
		if (vkUser.groupIds.length === 0) {
			return null;
		}

		const randomGroup = vkUser.groupIds[getRandom(0, vkUser.groupIds.length - 1)];
		const groupLink = hrefByGroupId(randomGroup);
		const rpcRequestArgs = {
			userCredentials,
			scrollCount,
			groupLink,
		};

		const rpcRequest = this.rpcRequestFactory.create(GroupFeedBrowseRpcRequest);
		rpcRequest.setArguments(rpcRequestArgs);
		return rpcRequest;
	}

	getGroupTask(userCredentials: VkUserCredentialsInterface): AbstractRpcRequest {
		const scrollCount = getRandom(0, 20);
		const rpcRequestArgs = {
			userCredentials,
			isPopular: false,
			isCommon: false,
			scrollCount,
		};

		const rpcRequest = this.rpcRequestFactory.create(GroupBrowseRpcRequest);
		const shouldLookPopular = getRandom(0, 100) > 50;
		if (shouldLookPopular) {
			rpcRequest.setArguments({ ...rpcRequestArgs, isPopular: true });
		} else {
			rpcRequest.setArguments({ ...rpcRequestArgs, isCommon: true });
		}

		return rpcRequest;
	}

	getMessageTask(userCredentials: VkUserCredentialsInterface): AbstractRpcRequest {
		const messageRpcTask = this.rpcRequestFactory.create(ReedMessagesRpcRequest);
		messageRpcTask.setArguments({ userCredentials });
		return messageRpcTask;
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
