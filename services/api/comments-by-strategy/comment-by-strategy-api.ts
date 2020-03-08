import { injectable } from 'inversify';
import { ModelType } from '@typegoose/typegoose/lib/types';
import moment from 'moment';
import { uniq } from 'lodash';
import { plainToClass } from 'class-transformer';
import { CommentByStrategyTaskInterface } from './comment-by-strategy-task.interface';
import { CommentsByStrategyTask } from './comments-by-strategy-task';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { User } from '../users/user';
import { statuses } from '../task/status.constant';
import { CommonTask } from '../task/common-task';

@injectable()
export class CommentByStrategyApi {
	constructor(
		@injectModel(CommentsByStrategyTask)
		private readonly CommentsByStrategyTaskModel: ModelType<CommentsByStrategyTask>,
	) {}

	async create(user: User, dto: CommentByStrategyTaskInterface): Promise<CommentsByStrategyTask> {
		const newTask = new this.CommentsByStrategyTaskModel();
		newTask.postLink = dto.postLink;
		newTask.commentsStrategy = dto.commentsStrategy;
		newTask.tasksCount = dto.commentsStrategy.length;
		newTask.startAt = moment();
		newTask.userTags = dto.userTags;
		newTask.user = user;

		await newTask.save();
		return plainToClass(CommentsByStrategyTask, newTask.toObject());
	}

	async getOwnedByUser(user: User): Promise<CommonTask[]> {
		const query = { deletedAt: null, user: user._id.toString() };
		const activeTasks = await this.CommentsByStrategyTaskModel.find({
			...query,
			$or: [{ status: statuses.waiting }, { status: statuses.pending }],
		})
			.sort({ createdAt: -1 })
			.lean()
			.exec();

		const lastInactiveTasks = await this.CommentsByStrategyTaskModel.find({
			...query,
			$or: [{ status: statuses.skipped }, { status: statuses.finished }],
		})
			.sort({ createdAt: -1 })
			.limit(10)
			.lean()
			.exec();

		return [
			...plainToClass(CommonTask, activeTasks),
			...plainToClass(CommonTask, lastInactiveTasks),
		];
	}

	async getRecentPostLinks(): Promise<string[]> {
		const tasks: CommentsByStrategyTask[] = await this.CommentsByStrategyTaskModel.find({
			status: { $in: [statuses.finished, statuses.pending] },
			createdAt: {
				$gte: moment()
					.startOf('d')
					.subtract(3, 'd'),
			},
		})
			.lean()
			.exec();

		return uniq(tasks.map(t => t.postLink));
	}
}
