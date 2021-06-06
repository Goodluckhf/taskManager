import { plainToClass } from 'class-transformer';
import { inject, injectable } from 'inversify';
import { TaskHandlerInterface } from '../../task/task-handler.interface';
import { CheckAccountTask } from './check-account-task';
import { VkUserCredentialsInterface } from '../vk-user-credentials.interface';
import { CheckAccountRpcResponse } from './check-account-rpc.response';
import { CheckAccountRpcRequest } from './check-account-rpc.request';
import RpcClient from '../../../../lib/amqp/rpc-client';
import { RpcRequestFactory } from '../../../../lib/amqp/rpc-request.factory';
import { ConfigInterface } from '../../../../config/config.interface';
import { UserAuthFailedException } from '../user-auth-failed.exception';
import { UnhandledAddUserException } from './unhandled-add-user.exception';
import { VkUserService } from '../vk-user.service';
import { VkUsersBanMetricsService } from '../../metrics/vk-users-ban-metrics.service';
import { RetriesExceededException } from '../../comments/retries-exceeded.exception';
import { UserAgentService } from '../../user-agents/user-agent.service';
import { UserAgentServiceInterface } from '../../user-agents/user-agent-service.interface';

@injectable()
export class CheckAccountTaskHandler implements TaskHandlerInterface {
	constructor(
		@inject(VkUserService) private readonly vkUserService: VkUserService,
		@inject(UserAgentService) private readonly userAgentService: UserAgentServiceInterface,
		@inject(RpcClient) private readonly rpcClient: RpcClient,
		@inject(RpcRequestFactory) private readonly rpcRequestFactory: RpcRequestFactory,
		@inject('Config') private readonly config: ConfigInterface,
		@inject(VkUsersBanMetricsService)
		private readonly vkUsersBanMetricsService: VkUsersBanMetricsService,
	) {}

	private async checkAccount(
		userCredentials: VkUserCredentialsInterface,
	): Promise<CheckAccountRpcResponse> {
		const rpcRequest = this.rpcRequestFactory.create(CheckAccountRpcRequest);
		rpcRequest.setArguments({
			userCredentials,
		});

		const response = await this.rpcClient.call<CheckAccountRpcResponse>(rpcRequest);
		return plainToClass(CheckAccountRpcResponse, response);
	}

	private async checkAccountWithRetry(
		userCredentials: VkUserCredentialsInterface,
		tryNumber = 0,
	): Promise<CheckAccountRpcResponse & { userAgent: string }> {
		if (tryNumber > 4) {
			throw new RetriesExceededException();
		}

		try {
			const checkAccountResult = await this.checkAccount(userCredentials);
			return { ...checkAccountResult, userAgent: userCredentials.userAgent };
		} catch (error) {
			if (error.code === 'old_user_agent') {
				await this.vkUserService.updateUserAgent(userCredentials.login);
				const newCredentials = await this.vkUserService.getCredentialsByLogin(
					userCredentials.login,
				);
				return this.checkAccountWithRetry(newCredentials, tryNumber + 1);
			}

			throw error;
		}
	}

	async handle(task: CheckAccountTask) {
		try {
			const { isActive, code, remixsid, userAgent } = await this.checkAccountWithRetry({
				login: task.usersCredentials.login,
				password: task.usersCredentials.password,
				proxy: task.usersCredentials.proxy,
				remixsid: task.usersCredentials.remixsid,
				userAgent: task.usersCredentials.userAgent,
			});

			if (!isActive) {
				await this.vkUserService.setInactive(task.usersCredentials.login, { code });
				await this.vkUsersBanMetricsService.increaseBannedBot(task.usersCredentials.login);
				throw new UserAuthFailedException(task.usersCredentials.login, code);
			}

			await this.vkUserService.setSensativeCredentials(
				task.usersCredentials.login,
				remixsid,
				userAgent,
			);
		} catch (error) {
			if (!(error instanceof UserAuthFailedException)) {
				throw new UnhandledAddUserException(task.usersCredentials.login, error);
			}

			throw error;
		}
	}
}
