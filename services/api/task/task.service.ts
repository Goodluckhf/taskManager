import { inject, injectable } from 'inversify';
import { ModelType } from '@typegoose/typegoose/lib/types';
import moment from 'moment';
import { plainToClass } from 'class-transformer';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { CommonTask } from './common-task';
import { statuses } from './status.constant';
import { ObjectableInterface } from '../../../lib/internal.types';
import { TaskServiceInterface } from './task-service.interface';
import { PendingTaskException } from './pending-task.exception';
import { User } from '../users/user';
import { LoggerInterface } from '../../../lib/logger.interface';

@injectable()
export class TaskService implements TaskServiceInterface {
	constructor(
		@injectModel(CommonTask) private readonly CommonTaskModel: ModelType<CommonTask>,
		@inject('Logger') private readonly logger: LoggerInterface,
	) {}

	async deleteOwnedByUser(user: User, id: string) {
		const task = await this.CommonTaskModel.findOne({ _id: id, user: user._id });

		if (!task) {
			this.logger.warn({
				message: 'Пытаются удалить чужой пост',
				taskId: id,
				userId: user._id.toString(),
			});
			return;
		}

		if (task.status === statuses.pending) {
			throw new PendingTaskException(id);
		}

		await this.CommonTaskModel.update({ _id: id }, { $set: { deletedAt: moment.now() } });
	}

	async getActive(): Promise<CommonTask[]> {
		const tasks = await this.CommonTaskModel.find({
			status: statuses.waiting,
			deletedAt: null,
			$or: [{ repeated: true }, { startAt: { $lte: new Date() } }],
		})
			.populate('user')
			.lean()
			.exec();

		return plainToClass(CommonTask, tasks);
	}

	async setPending(id: string) {
		await this.CommonTaskModel.update({ _id: id }, { $set: { status: statuses.pending } });
	}

	async finish(id: string) {
		await this.CommonTaskModel.update(
			{ _id: id },
			{ $set: { status: statuses.finished, lastHandleAt: moment() } },
		);
	}

	async finishWithError(id: string, error: ObjectableInterface) {
		await this.CommonTaskModel.update(
			{ _id: id },
			{
				$set: {
					status: statuses.finished,
					_error: error.toObject(),
					lastHandleAt: moment(),
				},
			},
		);
	}
}
