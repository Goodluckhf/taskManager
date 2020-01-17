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
				message: 'Этот пользователь уже вступил в группу',
				vkGroupId: task.groupId,
				...task.vkUserCredentials,
			});

			return;
		}

		const proxy = await this.proxyService.getRandom();

		const rpcRequest = this.rpcRequestFactory.create(JoinGroupRpcRequest);
		rpcRequest.setArguments({
			proxy,
			groupId: task.groupId,
			userCredentials: task.vkUserCredentials,
		});

		try {
			await this.rpcClient.call(rpcRequest);
		} catch (error) {
			throw new UnhandledJoinToGroupException(
				error,
				task.vkUserCredentials.login,
				task.groupId,
			);
		}
	}
}
