import { ModelType } from '@typegoose/typegoose/lib/types';
import { injectable } from 'inversify';
import moment from 'moment';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { FakeActivityTask } from './fake-activity.task';
import { User } from '../users/user';
import { getRandom } from '../../../lib/helper';
import { statuses } from '../task/status.constant';

@injectable()
export class FakeActivityTaskService {
	constructor(
		@injectModel(FakeActivityTask)
		private readonly FakeActivityTaskModel: ModelType<FakeActivityTask>,
	) {}

	async create(user: User, login: string) {
		const newTask = new this.FakeActivityTaskModel();
		newTask.login = login;
		const random = getRandom(0, 60 * 60 * 2);
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
