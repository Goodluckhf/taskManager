import { injectable } from 'inversify';
import { ModelType } from '@typegoose/typegoose/lib/types';
import moment from 'moment';
import { plainToClass } from 'class-transformer';
import { TaskCreationDto } from './dto/task-creation.dto';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { CheckAndAddUserTask } from './check-account/check-and-add-user.task';
import { User } from '../users/user';
import { statuses } from '../task/status.constant';
import { CheckAllUsersTask } from './check-account/check-all-users-task';
import { CheckAllUsersAlreadyExistsException } from './check-account/check-all-users-already-exists.exception';

@injectable()
export class VkUserTaskService {
	constructor(
		@injectModel(CheckAndAddUserTask)
		private readonly CheckAndAddUserTaskModel: ModelType<CheckAndAddUserTask>,
		@injectModel(CheckAllUsersTask)
		private readonly CheckAllUsersTaskModel: ModelType<CheckAllUsersTask>,
	) {}

	async createTask(user: User, dto: TaskCreationDto): Promise<CheckAndAddUserTask> {
		const newTask = new this.CheckAndAddUserTaskModel();
		newTask.usersCredentials = dto.usersCredentials;
		newTask.user = user;
		newTask.startAt = moment();
		await newTask.save();
		return plainToClass(CheckAndAddUserTask, newTask.toObject());
	}

	async createCheckAllUsersTask(user: User) {
		const count = await this.CheckAllUsersTaskModel.count({
			$or: [{ status: statuses.waiting }, { status: statuses.pending }],
		});

		if (count > 0) {
			throw new CheckAllUsersAlreadyExistsException();
		}

		const tasks = await this.CheckAllUsersTaskModel.find({
			status: statuses.finished,
		})
			.sort({
				startAt: -1,
			})
			.limit(1)
			.exec();

		const lastTask = tasks[0];
		const nextStartAt = lastTask ? moment(lastTask.startAt).add(10, 'm') : moment();
		const newTask = new this.CheckAllUsersTaskModel();
		newTask.user = user;
		newTask.startAt = nextStartAt;
		await newTask.save();
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
