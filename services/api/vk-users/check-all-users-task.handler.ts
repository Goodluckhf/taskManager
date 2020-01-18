import { inject, injectable } from 'inversify';
import bluebird from 'bluebird';
import { plainToClass } from 'class-transformer';
import { TaskHandlerInterface } from '../task/task-handler.interface';
import { CheckAndAddUserTask } from './check-and-add-user.task';
import { VkUserService } from './vk-user.service';
import { ProxyService } from '../proxies/proxy.service';
import { UserAuthFailedException } from './user-auth-failed.exception';
import { UnhandledAddUserException } from './unhandled-add-user.exception';
import { FormattableInterface, ObjectableInterface } from '../../../lib/internal.types';
import { SomeChecksFailedException } from './some-checks-failed.exception';
import RpcClient from '../../../lib/amqp/rpc-client';
import { CheckAccountRpcResponse } from './check-account-rpc.response';
import { RpcRequestFactory } from '../../../lib/amqp/rpc-request.factory';
import { CheckAccountRpcRequest } from './check-account-rpc.request';
import { ProxyInterface } from '../proxies/proxy.interface';
import { VkUserCredentialsInterface } from './vk-user-credentials.interface';

@injectable()
export class CheckAllUsersTaskHandler implements TaskHandlerInterface {
	constructor(
		@inject(VkUserService) private readonly vkUserService: VkUserService,
		@inject(ProxyService) private readonly proxyService: ProxyService,
		@inject(RpcClient) private readonly rpcClient: RpcClient,
		@inject(RpcRequestFactory) private readonly rpcRequestFactory: RpcRequestFactory,
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

	async handle(task: CheckAndAddUserTask) {
		const vkUsers = await this.vkUserService.getAllActive();
		const errors: Array<ObjectableInterface & FormattableInterface> = [];

		await bluebird.map(
			vkUsers,
			async ({ login, password }) => {
				try {
					const proxy = await this.proxyService.getRandom();

					const { isActive, code } = await this.checkAccount({ login, password }, proxy);
					if (!isActive) {
						await this.vkUserService.setInactive(login, { code });
						errors.push(new UserAuthFailedException(login, code));
					}
				} catch (error) {
					errors.push(new UnhandledAddUserException(login, error));
				}
			},
			{ concurrency: 20 },
		);

		if (errors.length) {
			throw new SomeChecksFailedException(errors);
		}
	}
}
