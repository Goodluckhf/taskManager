import { plainToClass } from 'class-transformer';
import { inject, injectable } from 'inversify';
import { TaskHandlerInterface } from '../../task/task-handler.interface';
import { CheckAccountTask } from './check-account-task';
import { VkUserCredentialsInterface } from '../vk-user-credentials.interface';
import { ProxyInterface } from '../../proxies/proxy.interface';
import { CheckAccountRpcResponse } from './check-account-rpc.response';
import { CheckAccountRpcRequest } from './check-account-rpc.request';
import { ProxyService } from '../../proxies/proxy.service';
import RpcClient from '../../../../lib/amqp/rpc-client';
import { RpcRequestFactory } from '../../../../lib/amqp/rpc-request.factory';
import { ConfigInterface } from '../../../../config/config.interface';
import { UserAuthFailedException } from '../user-auth-failed.exception';
import { UnhandledAddUserException } from './unhandled-add-user.exception';
import { VkUserService } from '../vk-user.service';

@injectable()
export class CheckAccountTaskHandler implements TaskHandlerInterface {
	constructor(
		@inject(VkUserService) private readonly vkUserService: VkUserService,
		@inject(ProxyService) private readonly proxyService: ProxyService,
		@inject(RpcClient) private readonly rpcClient: RpcClient,
		@inject(RpcRequestFactory) private readonly rpcRequestFactory: RpcRequestFactory,
		@inject('Config') private readonly config: ConfigInterface,
	) {}

	private async checkAccount(
		userCredentials: VkUserCredentialsInterface,
		proxy: ProxyInterface,
	): Promise<CheckAccountRpcResponse> {
		const rpcRequest = this.rpcRequestFactory.create(CheckAccountRpcRequest);
		rpcRequest.setArguments({
			userCredentials,
			proxy,
		});

		const response = await this.rpcClient.call<CheckAccountRpcResponse>(rpcRequest);
		return plainToClass(CheckAccountRpcResponse, response);
	}

	async handle(task: CheckAccountTask) {
		try {
			const proxy = await this.proxyService.getRandom();

			const { isActive, code } = await this.checkAccount(
				{ login: task.usersCredentials.login, password: task.usersCredentials.password },
				proxy,
			);
			if (!isActive) {
				await this.vkUserService.setInactive(task.usersCredentials.login, { code });
				throw new UserAuthFailedException(task.usersCredentials.login, code);
			}
		} catch (error) {
			if (!(error instanceof UserAuthFailedException)) {
				throw new UnhandledAddUserException(task.usersCredentials.login, error);
			}

			throw error;
		}
	}
}
