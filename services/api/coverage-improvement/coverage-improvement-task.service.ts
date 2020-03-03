import { inject, injectable } from 'inversify';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { ConfigInterface } from '../../../config/config.interface';
import { CoverageImprovementTask } from './coverage-improvement.task';
import { User } from '../users/user';
import { DelayableTaskInterface } from '../task/delayable-task.interface';
import { statuses } from '../task/status.constant';

@injectable()
export class CoverageImprovementTaskService {
	constructor(
		@injectModel(CoverageImprovementTask)
		private readonly CoverageImprovementTaskModel: ModelType<CoverageImprovementTask>,
		@inject('Config') private readonly config: ConfigInterface,
	) {}

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
