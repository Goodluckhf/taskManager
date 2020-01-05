import { injectable } from 'inversify';
import { ModelType } from '@typegoose/typegoose/lib/types';
import moment from 'moment';
import { plainToClass } from 'class-transformer';
import { TaskCreationDto } from './task-creation.dto';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { CheckAndAddUserTask } from './check-and-add-user.task';
import { User } from '../users/user';
import { statuses } from '../task/status.constant';

@injectable()
export class VkUserTaskService {
	constructor(
		@injectModel(CheckAndAddUserTask)
		private readonly CheckAndAddUserTaskModel: ModelType<CheckAndAddUserTask>,
	) {}

	async createTask(user: User, dto: TaskCreationDto): Promise<CheckAndAddUserTask> {
		const newTask = new this.CheckAndAddUserTaskModel();
		newTask.usersCredentials = dto.usersCredentials;
		newTask.user = user;
		newTask.startAt = moment();
		await newTask.save();
		return plainToClass(CheckAndAddUserTask, newTask.toObject());
	}

	async getTasksForUser(user: User): Promise<CheckAndAddUserTask[]> {
		const query = { deletedAt: null, user };
		const activeTasks = await this.CheckAndAddUserTaskModel.find({
			...query,
			$or: [{ status: statuses.waiting }, { status: statuses.pending }],
		})
			.sort({ createdAt: -1 })
			.lean()
			.exec();

		const lastInactiveTasks = await this.CheckAndAddUserTaskModel.find({
			...query,
			$or: [{ status: statuses.skipped }, { status: statuses.finished }],
		})
			.sort({ createdAt: -1 })
			.limit(10)
			.lean()
			.exec();

		return plainToClass(CheckAndAddUserTask, [...activeTasks, ...lastInactiveTasks]);
	}
}
