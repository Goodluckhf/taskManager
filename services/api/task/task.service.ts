import { injectable } from 'inversify';
import { ModelType } from '@typegoose/typegoose/lib/types';
import moment from 'moment';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { CommonTask } from './common-task';
import { statuses } from './status.constant';
import { ObjectableInterface } from '../../../lib/internal.types';
import { TaskServiceInterface } from './task-service.interface';
import { PendingTaskException } from './pending-task.exception';

@injectable()
export class TaskService implements TaskServiceInterface {
	constructor(@injectModel(CommonTask) private readonly CommonTaskModel: ModelType<CommonTask>) {}

	async delete(id: string) {
		const task = await this.CommonTaskModel.findOne({ _id: id });
		if (task.status === statuses.pending) {
			throw new PendingTaskException(id);
		}

		await this.CommonTaskModel.update({ _id: id }, { $set: { deletedAt: moment.now() } });
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
