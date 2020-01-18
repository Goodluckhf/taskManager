import { inject, injectable } from 'inversify';
import { TaskHandlerInterface } from '../task/task-handler.interface';
import { JoinToGroupTask } from './join-to-group.task';
import { VkUserService } from './vk-user.service';
import { LoggerInterface } from '../../../lib/logger.interface';
import RpcClient from '../../../lib/amqp/rpc-client';
import { RpcRequestFactory } from '../../../lib/amqp/rpc-request.factory';
import { JoinGroupRpcRequest } from './join-group-rpc.request';
import { ProxyService } from '../proxies/proxy.service';
import { UnhandledJoinToGroupException } from './unhandled-join-to-group.exception';
import { VkUserCredentialsInterface } from './vk-user-credentials.interface';

@injectable()
export class JoinToGroupTaskHandler implements TaskHandlerInterface {
	constructor(
		@inject(VkUserService) private readonly vkUserService: VkUserService,
		@inject('Logger') private readonly logger: LoggerInterface,
		@inject(RpcClient) private readonly rpcClient: RpcClient,
		@inject(RpcRequestFactory) private readonly rpcRequestFactory: RpcRequestFactory,
		@inject(ProxyService) private readonly proxyService: ProxyService,
	) {}

	async handle(task: JoinToGroupTask) {
		if (await this.vkUserService.hasUserJoinedGroup(task.vkUserCredentials, task.groupId)) {
			this.logger.warn({
				message: 'Этот пользователь уже вступил в группу ранее',
				vkGroupId: task.groupId,
				userCredentials: task.vkUserCredentials,
			});

			return;
		}

		await this.joinToGroup(task.vkUserCredentials, task.groupId);
		await this.vkUserService.addGroup(task.vkUserCredentials, task.groupId);
	}

	private async joinToGroup(vkUserCredentials: VkUserCredentialsInterface, groupId: string) {
		const proxy = await this.proxyService.getRandom();

		const rpcRequest = this.rpcRequestFactory.create(JoinGroupRpcRequest);
		rpcRequest.setArguments({
			proxy,
			groupId,
			userCredentials: vkUserCredentials,
		});

		try {
			await this.rpcClient.call(rpcRequest);
		} catch (error) {
			if (error.code === 'login_failed' || error.code === 'blocked') {
				await this.vkUserService.setInactive(vkUserCredentials.login, { code: error.code });
			}

			if (error.code !== 'already_joined') {
				throw new UnhandledJoinToGroupException(error, vkUserCredentials.login, groupId);
			}

			this.logger.warn({
				message: 'Пользователь уже состоит в группе',
				vkGroupId: groupId,
				userCredentials: vkUserCredentials,
			});
		}
	}
}
