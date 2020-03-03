import { inject, injectable } from 'inversify';
import moment from 'moment';
import { TaskHandlerInterface } from '../task/task-handler.interface';
import { CoverageImprovementTask } from './coverage-improvement.task';
import { RpcRequestFactory } from '../../../lib/amqp/rpc-request.factory';
import RpcClient from '../../../lib/amqp/rpc-client';
import { CoverageImprovementRpcRequest } from './coverage-improvement-rpc.request';
import { VkUserService } from '../vk-users/vk-user.service';
import { CommentByStrategyApi } from '../comments-by-strategy/comment-by-strategy-api';
import { SessionTokenRpcResponseInterface } from '../vk-users/session-token-rpc-response.interface';
import { LoggerInterface } from '../../../lib/logger.interface';
import { AuthExceptionCatcher } from '../vk-users/auth-exception.catcher';
import { CoverageImprovementTaskService } from './coverage-improvement-task.service';
import { getRandom } from '../../../lib/helper';
import { ConfigInterface } from '../../../config/config.interface';
import { User } from '../users/user';

@injectable()
export class CoverageImprovementTaskHandler implements TaskHandlerInterface {
	constructor(
		@inject(RpcRequestFactory) private readonly rpcRequestFactory: RpcRequestFactory,
		@inject(RpcClient) private readonly rpcClient: RpcClient,
		@inject(VkUserService) private readonly vkUserService: VkUserService,
		@inject(CommentByStrategyApi) private readonly commentByStrategyApi: CommentByStrategyApi,
		@inject('Logger') private readonly logger: LoggerInterface,
		@inject(AuthExceptionCatcher) private readonly authExceptionCatcher: AuthExceptionCatcher,
		@inject(CoverageImprovementTaskService)
		private readonly coverageImprovementTaskService: CoverageImprovementTaskService,
		@inject('Config') private readonly config: ConfigInterface,
	) {}

	async handle(task: CoverageImprovementTask) {
		const userCredentials = await this.vkUserService.getCredentialsByLogin(task.login);
		const postLinks = await this.commentByStrategyApi.getRecentPostLinks();

		const rpcRequest = this.rpcRequestFactory.create(CoverageImprovementRpcRequest);
		rpcRequest.setArguments({ userCredentials, postLinks });

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
				message: 'Ошибка при накрутке охвата',
				taskId: task._id.toString(),
				method: rpcRequest.getMethod(),
				taskArguments: rpcRequest.getArguments(),
				login: task.login,
				error,
			});
		}

		const activeTasksCount = await this.coverageImprovementTaskService.getActiveTasksCount();

		const randomExtraSeconds = getRandom(
			0,
			(activeTasksCount * 60) / this.config.get('coverageImprovementTask.tasksPerMinute'),
		);

		await this.coverageImprovementTaskService.create(task.user as User, {
			login: task.login,
			startAt: moment().add(
				randomExtraSeconds + this.config.get('coverageImprovementTask.baseDelay'),
				's',
			),
		});
	}
}
