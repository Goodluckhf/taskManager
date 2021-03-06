import { inject, injectable } from 'inversify';
import { TaskHandlerInterface } from '../task/task-handler.interface';
import { CommentComplainTask } from './comment-complain-task';
import { ConfigInterface } from '../../../config/config.interface';
import RpcClient from '../../../lib/amqp/rpc-client';
import { LoggerInterface } from '../../../lib/logger.interface';
import { RpcRequestFactory } from '../../../lib/amqp/rpc-request.factory';
import { CommentComplainRpcRequest } from './comment-complain-rpc.request';
import { VkUserService } from '../vk-users/vk-user.service';
import { AuthExceptionCatcher } from '../vk-users/auth-exception.catcher';
import { SessionTokenRpcResponseInterface } from '../vk-users/session-token-rpc-response.interface';

@injectable()
export class CommentComplainTaskHandler implements TaskHandlerInterface {
	constructor(
		@inject('Config') private readonly config: ConfigInterface,
		@inject(RpcClient) private readonly rpcClient: RpcClient,
		@inject('Logger') private readonly logger: LoggerInterface,
		@inject(RpcRequestFactory) private readonly rpcRequestFactory: RpcRequestFactory,
		@inject(VkUserService) private readonly vkUserService: VkUserService,
		@inject(AuthExceptionCatcher) private readonly authExceptionCatcher: AuthExceptionCatcher,
	) {}

	async handle(task: CommentComplainTask) {
		const rpcRequest = this.rpcRequestFactory.create(CommentComplainRpcRequest);

		const userCredentials = await this.vkUserService.getCredentialsByLogin(task.login);
		rpcRequest.setArguments({ postLink: task.postLink, userCredentials });
		try {
			const response = await this.rpcClient.call<SessionTokenRpcResponseInterface>(
				rpcRequest,
			);

			await this.vkUserService.updateSession(task.login, response.remixsid);
		} catch (error) {
			const catched = await this.authExceptionCatcher.catch(error, userCredentials);
			if (catched) {
				return;
			}

			this.logger.error({
				message: 'Ошибка при жалобе на пост',
				login: task.login,
				taskId: task._id.toString(),
				traceId: rpcRequest.getId(),
			});
			throw error;
		}
	}
}
