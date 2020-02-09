import { inject, injectable } from 'inversify';
import { getRandom, hrefByGroupId } from '../../../lib/helper';
import { AbstractRpcRequest } from '../../../lib/amqp/abstract-rpc-request';
import { RpcRequestFactory } from '../../../lib/amqp/rpc-request.factory';
import { ReedFeedRpcRequest } from './reed-feed-rpc.request';
import { VkUserCredentialsInterface } from '../vk-users/vk-user-credentials.interface';
import { ReedMessagesRpcRequest } from './reed-messages-rpc.request';
import { GroupBrowseRpcRequest } from './group-browse-rpc.request';
import { VkUserService } from '../vk-users/vk-user.service';
import { GroupFeedBrowseRpcRequest } from './group-feed-browse-rpc.request';
import { VkUser } from '../vk-users/vk-user';

@injectable()
export class FakeActivityRandomizerFactory {
	@inject(RpcRequestFactory) private readonly rpcRequestFactory: RpcRequestFactory;

	@inject(VkUserService) private readonly vkUserService: VkUserService;

	getRandomTasks({ userCredentials }: { userCredentials: VkUser }): AbstractRpcRequest[] {
		const taskRpcRequests: AbstractRpcRequest[] = [];
		const {
			login,
			password,
			proxy,
			userAgent,
			remixsid,
		}: VkUserCredentialsInterface = userCredentials;
		const randomNumber = getRandom(0, 100);
		if (randomNumber) {
			taskRpcRequests.push(
				this.getFeedTask({
					login,
					password,
					proxy,
					userAgent,
					remixsid,
				}),
			);
		} else if (randomNumber < 70) {
			taskRpcRequests.push(
				this.getMessageTask({
					login,
					password,
					proxy,
					userAgent,
					remixsid,
				}),
			);
		} else {
			taskRpcRequests.push(
				this.getGroupTask({
					login,
					password,
					proxy,
					userAgent,
					remixsid,
				}),
			);
		}

		if (randomNumber > 50 && userCredentials.groupIds.length > 0) {
			const rpcRequest = this.getGroupFeedTask(userCredentials);
			taskRpcRequests.push(rpcRequest);
		}

		return taskRpcRequests;
	}

	private getGroupFeedTask(userCredentials: VkUser): AbstractRpcRequest {
		const scrollCount = getRandom(0, 20);
		const randomGroup =
			userCredentials.groupIds[getRandom(0, userCredentials.groupIds.length - 1)];
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

	private getGroupTask(userCredentials: VkUserCredentialsInterface): AbstractRpcRequest {
		const scrollCount = getRandom(0, 20);
		const rpcRequestArgs = {
			userCredentials,
			isPopular: false,
			isCommon: false,
			shouldChangeCategory: false,
			shouldGotoGroup: false,
			scrollCount,
		};

		const rpcRequest = this.rpcRequestFactory.create(GroupBrowseRpcRequest);
		const shouldLookPopular = getRandom(0, 100) > 50;
		if (shouldLookPopular) {
			const shouldChangeCategory = getRandom(0, 100) > 50;
			const shouldGotoGroup = getRandom(0, 100) > 40;
			rpcRequest.setArguments({
				...rpcRequestArgs,
				isPopular: true,
				shouldChangeCategory,
				shouldGotoGroup,
			});
		} else {
			rpcRequest.setArguments({ ...rpcRequestArgs, isCommon: true });
		}

		return rpcRequest;
	}

	private getMessageTask(userCredentials: VkUserCredentialsInterface): AbstractRpcRequest {
		const messageRpcTask = this.rpcRequestFactory.create(ReedMessagesRpcRequest);
		messageRpcTask.setArguments({ userCredentials });
		return messageRpcTask;
	}

	private getFeedTask(userCredentials: VkUserCredentialsInterface): AbstractRpcRequest {
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
