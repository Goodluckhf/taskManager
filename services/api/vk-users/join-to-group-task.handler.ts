import { inject, injectable } from 'inversify';
import { TaskHandlerInterface } from '../task/task-handler.interface';
import { JoinToGroupTask } from './join-to-group.task';
import { VkUserService } from './vk-user.service';
import { LoggerInterface } from '../../../lib/logger.interface';
import RpcClient from '../../../lib/amqp/rpc-client';
import { RpcRequestFactory } from '../../../lib/amqp/rpc-request.factory';
import { JoinGroupRpcRequest } from './join-group-rpc.request';
import { UnhandledJoinToGroupException } from './unhandled-join-to-group.exception';
import { VkUserCredentialsInterface } from './vk-user-credentials.interface';
import { AuthExceptionCatcher } from './auth-exception.catcher';

@injectable()
export class JoinToGroupTaskHandler implements TaskHandlerInterface {
	constructor(
		@inject(VkUserService) private readonly vkUserService: VkUserService,
		@inject('Logger') private readonly logger: LoggerInterface,
		@inject(RpcClient) private readonly rpcClient: RpcClient,
		@inject(RpcRequestFactory) private readonly rpcRequestFactory: RpcRequestFactory,
		@inject(AuthExceptionCatcher) private readonly authExceptionCatcher: AuthExceptionCatcher,
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
		const rpcRequest = this.rpcRequestFactory.create(JoinGroupRpcRequest);
		rpcRequest.setArguments({
			groupId,
			userCredentials: vkUserCredentials,
		});

		try {
			await this.rpcClient.call(rpcRequest);
		} catch (error) {
			await this.authExceptionCatcher.catch(error, vkUserCredentials);

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
