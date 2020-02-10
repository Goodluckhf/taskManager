import { ModelType } from '@typegoose/typegoose/lib/types';
import { inject, injectable } from 'inversify';
import moment from 'moment';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { FakeActivityTask } from './fake-activity.task';
import { User } from '../users/user';
import { getRandom } from '../../../lib/helper';
import { statuses } from '../task/status.constant';
import { ConfigInterface } from '../../../config/config.interface';

@injectable()
export class FakeActivityTaskService {
	constructor(
		@injectModel(FakeActivityTask)
		private readonly FakeActivityTaskModel: ModelType<FakeActivityTask>,
		@inject('Config') private readonly config: ConfigInterface,
	) {}

	async create(user: User, login: string) {
		const newTask = new this.FakeActivityTaskModel();
		newTask.login = login;
		// Не раньше чем через час
		const random = getRandom(60 * 60, this.config.get('fakeActivityTask.interval'));
		newTask.startAt = moment().add(random, 's');
		await newTask.save();
	}

	async createIfNotExists(user: User, login: string) {
		const taskCount = await this.FakeActivityTaskModel.count({
			$or: [{ status: statuses.waiting }, { status: statuses.pending }],
			deletedAt: null,
			login,
		});

		if (taskCount > 0) {
			return;
		}

		await this.create(user, login);
	}
}
