import { inject, injectable } from 'inversify';
import bluebird from 'bluebird';
import { TaskHandlerInterface } from '../task/task-handler.interface';
import { FakeActivityTask } from './fake-activity.task';
import { VkUserService } from '../vk-users/vk-user.service';
import RpcClient from '../../../lib/amqp/rpc-client';
import { LoggerInterface } from '../../../lib/logger.interface';
import { FakeActivityTaskService } from './fake-activity-task.service';
import { User } from '../users/user';
import { AuthExceptionCatcher } from '../vk-users/auth-exception.catcher';
import { FakeActivityRandomizerFactory } from './fake-activity-randomizer.factory';

@injectable()
export class FakeActivityTaskHandler implements TaskHandlerInterface {
	constructor(
		@inject(VkUserService) private readonly vkUserService: VkUserService,
		@inject(FakeActivityRandomizerFactory)
		private readonly fakeActivityRandomizerFactory: FakeActivityRandomizerFactory,
		@inject(RpcClient) private readonly rpcClient: RpcClient,
		@inject('Logger') private readonly logger: LoggerInterface,
		@inject(FakeActivityTaskService)
		private readonly fakeActivityTaskService: FakeActivityTaskService,
		@inject(AuthExceptionCatcher) private readonly authExceptionCatcher: AuthExceptionCatcher,
	) {}

	async handle(task: FakeActivityTask) {
		const vkUser = await this.vkUserService.findByLogin(task.login);
		const rpcRequests = this.fakeActivityRandomizerFactory.getRandomTasks({
			userCredentials: vkUser,
		});

		await bluebird.map(
			rpcRequests,
			async rpcRequest => {
				try {
					await this.rpcClient.call(rpcRequest);
				} catch (error) {
					const catched = await this.authExceptionCatcher.catch(error, vkUser);
					if (catched) {
						return;
					}

					this.logger.error({
						message: 'Ошибка при фейковой активности',
						taskId: task._id.toString(),
						method: rpcRequest.getMethod(),
						taskArguments: rpcRequest.getArguments(),
						login: task.login,
						error,
					});
				}
			},
			{ concurrency: 1 },
		);

		await this.fakeActivityTaskService.create(task.user as User, task.login);
	}
}
