import { inject, injectable } from 'inversify';
import { ModelType } from '@typegoose/typegoose/lib/types';
import bluebird from 'bluebird';
import moment from 'moment';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { ConfigInterface } from '../../../config/config.interface';
import { CoverageImprovementTask } from './coverage-improvement.task';
import { User } from '../users/user';
import { DelayableTaskInterface } from '../task/delayable-task.interface';
import { statuses } from '../task/status.constant';
import { tagsEnum } from '../vk-users/tags-enum.constant';
import { VkUserService } from '../vk-users/vk-user.service';
import { getRandom } from '../../../lib/helper';

@injectable()
export class CoverageImprovementTaskService {
	constructor(
		@injectModel(CoverageImprovementTask)
		private readonly CoverageImprovementTaskModel: ModelType<CoverageImprovementTask>,
		@inject('Config') private readonly config: ConfigInterface,
		@inject(VkUserService) private readonly vkUserService: VkUserService,
	) {}

	async createForUsers(user: User, tags: tagsEnum[]) {
		const usersCredentials = await this.vkUserService.getAllActive(tags);
		await bluebird.map(
			usersCredentials,
			async credentials => {
				const tasksCount = await this.CoverageImprovementTaskModel.count({
					status: { $in: [statuses.waiting, statuses.pending] },
					login: credentials.login,
				});
				if (tasksCount > 0) {
					return;
				}

				const randomExtraSeconds = getRandom(
					0,
					(usersCredentials.length * 60) /
						this.config.get('coverageImprovementTask.tasksPerMinute'),
				);

				await this.create(user, {
					login: credentials.login,
					startAt: moment().add(
						randomExtraSeconds + this.config.get('coverageImprovementTask.baseDelay'),
						's',
					),
				});
			},
			{ concurrency: 10 },
		);
	}

	async create(user: User, opts: { login: string } & DelayableTaskInterface) {
		const task = new this.CoverageImprovementTaskModel();

		task.user = user;
		task.login = opts.login;
		task.startAt = opts.startAt;
		await task.save();
	}

	async getActiveTasksCount() {
		return this.CoverageImprovementTaskModel.count({
			status: { $in: [statuses.pending, statuses.waiting] },
		});
	}
}
