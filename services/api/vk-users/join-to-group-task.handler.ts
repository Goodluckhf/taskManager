import { inject, injectable } from 'inversify';
import { ModelType } from '@typegoose/typegoose/lib/types';
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
import { statuses } from '../task/status.constant';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { SessionTokenRpcResponseInterface } from './session-token-rpc-response.interface';

@injectable()
export class JoinToGroupTaskHandler implements TaskHandlerInterface {
	constructor(
		@inject(VkUserService) private readonly vkUserService: VkUserService,
		@injectModel(JoinToGroupTask)
		private readonly JoinToGroupTaskModel: ModelType<JoinToGroupTask>,
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

		const vkUser = await this.vkUserService.getCredentialsByLogin(
			task.vkUserCredentials.login,
			true,
		);

		if (!vkUser) {
			this.logger.warn({
				message: 'этого пользователя уже забанили',
				userCredentials: task.vkUserCredentials,
			});
			await this.JoinToGroupTaskModel.updateMany(
				{
					'vkUserCredentials.login': task.vkUserCredentials.login,
					status: statuses.waiting,
				},
				{ $set: { status: statuses.finished } },
			);
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
			const response = await this.rpcClient.call<SessionTokenRpcResponseInterface>(
				rpcRequest,
			);

			await this.vkUserService.updateSession(vkUserCredentials.login, response.remixsid);
		} catch (error) {
			await this.authExceptionCatcher.catch(error, vkUserCredentials);

			if (error.code !== 'already_joined') {
				throw new UnhandledJoinToGroupException(error, vkUserCredentials.login, groupId);
			}

			this.logger.warn({
				message: 'Пользователь уже состоит в группе',
				vkGroupId: groupId,
				traceId: rpcRequest.getId(),
				userCredentials: vkUserCredentials,
			});
		}
	}
}
