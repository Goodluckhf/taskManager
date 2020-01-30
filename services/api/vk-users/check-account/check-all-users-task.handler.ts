import { inject, injectable } from 'inversify';
import bluebird from 'bluebird';
import moment from 'moment';
import { TaskHandlerInterface } from '../../task/task-handler.interface';
import { CheckAndAddUserTask } from './check-and-add-user.task';
import { VkUserService } from '../vk-user.service';
import { UnhandledAddUserException } from './unhandled-add-user.exception';
import { FormattableInterface, ObjectableInterface } from '../../../../lib/internal.types';
import { SomeChecksFailedException } from './some-checks-failed.exception';
import { CheckAccountTaskService } from './check-account-task.service';
import { getRandom } from '../../../../lib/helper';
import { User } from '../../users/user';

@injectable()
export class CheckAllUsersTaskHandler implements TaskHandlerInterface {
	constructor(
		@inject(VkUserService) private readonly vkUserService: VkUserService,
		@inject(CheckAccountTaskService)
		private readonly checkAccountTaskService: CheckAccountTaskService,
	) {}

	async handle(task: CheckAndAddUserTask) {
		const vkUsers = await this.vkUserService.getAllActive();
		const errors: Array<ObjectableInterface & FormattableInterface> = [];

		await this.checkAccountTaskService.setSubTasksCount(task._id, vkUsers.length);

		await bluebird.map(
			vkUsers,
			async ({ login, password, proxy }) => {
				try {
					const randomStartAt = moment().add(
						getRandom(0, (vkUsers.length * 60) / 20),
						's',
					);

					await this.checkAccountTaskService.createTask({
						usersCredentials: { login, password, proxy },
						startAt: randomStartAt,
						user: task.user as User,
						parentTaskId: task._id,
					});
				} catch (error) {
					errors.push(new UnhandledAddUserException(login, error));
				}
			},
			{ concurrency: 30 },
		);

		if (errors.length) {
			throw new SomeChecksFailedException(errors);
		}
	}
}
