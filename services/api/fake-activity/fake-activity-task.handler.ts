import { inject, injectable } from 'inversify';
import { TaskHandlerInterface } from '../task/task-handler.interface';
import { FakeActivityTask } from './fake-activity.task';
import { VkUserService } from '../vk-users/vk-user.service';
import { RpcRequestFactory } from '../../../lib/amqp/rpc-request.factory';
import { FakeActivityRpcRequest } from './fake-activity-rpc.request';
import RpcClient from '../../../lib/amqp/rpc-client';
import { LoggerInterface } from '../../../lib/logger.interface';
import { FakeActivityTaskService } from './fake-activity-task.service';
import { User } from '../users/user';
import { AuthExceptionCatcher } from '../vk-users/auth-exception.catcher';

@injectable()
export class FakeActivityTaskHandler implements TaskHandlerInterface {
	constructor(
		@inject(VkUserService) private readonly vkUserService: VkUserService,
		@inject(RpcRequestFactory) private readonly rpcRequestFactory: RpcRequestFactory,
		@inject(RpcClient) private readonly rpcClient: RpcClient,
		@inject('Logger') private readonly logger: LoggerInterface,
		@inject(FakeActivityTaskService)
		private readonly fakeActivityTaskService: FakeActivityTaskService,
		@inject(AuthExceptionCatcher) private readonly authExceptionCatcher: AuthExceptionCatcher,
	) {}

	async handle(task: FakeActivityTask) {
		const vkUser = await this.vkUserService.getCredentialsByLogin(task.login);
		const request = this.rpcRequestFactory.create(FakeActivityRpcRequest);
		request.setArguments({ userCredentials: vkUser });
		try {
			await this.rpcClient.call(request);
		} catch (error) {
			const catched = await this.authExceptionCatcher.catch(error, vkUser);
			if (catched) {
				return;
			}

			this.logger.error({
				message: 'Ошибка при фейковой активности',
				taskId: task._id.toString(),
				login: task.login,
				error,
			});
		}

		await this.fakeActivityTaskService.create(task.user as User, task.login);
	}
}
