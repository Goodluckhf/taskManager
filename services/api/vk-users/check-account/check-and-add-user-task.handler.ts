import { inject, injectable } from 'inversify';
import bluebird from 'bluebird';
import { plainToClass } from 'class-transformer';
import { TaskHandlerInterface } from '../../task/task-handler.interface';
import { CheckAndAddUserTask } from './check-and-add-user.task';
import { UserExistsException } from '../user-exists.exception';
import { VkUserService } from '../vk-user.service';
import { UserAuthFailedException } from '../user-auth-failed.exception';
import { UnhandledAddUserException } from './unhandled-add-user.exception';
import { FormattableInterface, ObjectableInterface } from '../../../../lib/internal.types';
import { SomeChecksFailedException } from './some-checks-failed.exception';
import RpcClient from '../../../../lib/amqp/rpc-client';
import { CheckAccountRpcResponse } from './check-account-rpc.response';
import { RpcRequestFactory } from '../../../../lib/amqp/rpc-request.factory';
import { CheckAccountRpcRequest } from './check-account-rpc.request';
import { VkUserCredentialsInterface } from '../vk-user-credentials.interface';
import { GroupJoinTaskService } from '../group-join-task.service';
import { User } from '../../users/user';
import { ConfigInterface } from '../../../../config/config.interface';

@injectable()
export class CheckAndAddUserTaskHandler implements TaskHandlerInterface {
	constructor(
		@inject(VkUserService) private readonly vkUserService: VkUserService,
		@inject(GroupJoinTaskService) private readonly groupJoinTaskService: GroupJoinTaskService,
		@inject(RpcClient) private readonly rpcClient: RpcClient,
		@inject(RpcRequestFactory) private readonly rpcRequestFactory: RpcRequestFactory,
		@inject('Config') private readonly config: ConfigInterface,
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

	async handle(task: CheckAndAddUserTask) {
		const errors: Array<ObjectableInterface & FormattableInterface> = [];
		await bluebird.map(
			task.usersCredentials,
			async ({ login, password, proxy }) => {
				try {
					if (await this.vkUserService.exists(login)) {
						errors.push(new UserExistsException(login));
						return;
					}

					const { isActive, code, remixsid, userAgent } = await this.checkAccount({
						login,
						password,
						proxy,
					});
					if (!isActive) {
						errors.push(new UserAuthFailedException(login, code));
						return;
					}

					await this.vkUserService.addUser({ login, password, proxy, remixsid });
					await this.createTasksForGroupJoin(task.user as User, {
						login,
						password,
						proxy,
						remixsid,
						userAgent,
					});

					await this.vkUserService.addUser({
						login,
						password,
						proxy,
						remixsid,
						userAgent,
					});
				} catch (error) {
					errors.push(new UnhandledAddUserException(login, error));
				}
			},
			{ concurrency: 10 },
		);

		if (errors.length) {
			throw new SomeChecksFailedException(errors);
		}
	}

	private async createTasksForGroupJoin(
		user: User,
		vkUserCredentials: VkUserCredentialsInterface,
	) {
		const groupIdsForJoin = await this.getGroupIds();
		await bluebird.map(
			groupIdsForJoin,
			async groupId => {
				await this.groupJoinTaskService.createTask(user, {
					groupId,
					vkUserCredentials,
					min: this.config.get('groupJoinTask.allUsers.min'),
					max: this.config.get('groupJoinTask.allUsers.max'),
				});
			},
			{ concurrency: 10 },
		);
	}

	private async getGroupIds(): Promise<string[]> {
		const activeUsers = await this.vkUserService.getAllActive();
		const maxGroupObject = activeUsers.reduce(
			(obj, vkUser, key) => {
				if (vkUser.groupIds.length > obj.max) {
					obj.max = vkUser.groupIds.length;
					obj.key = key;
				}

				return obj;
			},
			{ max: 0, key: 0 },
		);

		if (activeUsers.length === 0) {
			return [];
		}

		return activeUsers[maxGroupObject.key].groupIds;
	}
}
