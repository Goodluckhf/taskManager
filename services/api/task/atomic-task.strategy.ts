import { inject, injectable } from 'inversify';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { Types } from 'mongoose';
import { TaskStrategyInterface } from './task-strategy.interface';
import { TaskHandlerInterface } from './task-handler.interface';
import { ObjectableInterface } from '../../../lib/internal.types';
import { UnhandledTaskException } from './unhandled-task.exception';
import { User } from '../users/user';
import { TaskService } from './task.service';
import { TaskServiceInterface } from './task-service.interface';
import { LoggerInterface } from '../../../lib/logger.interface';
import { TaskMetricsService } from '../metrics/task-metrics.service';
import { TaskMetricsServiceInterface } from '../metrics/task-metrics-service.interface';
import { CommonTask } from './common-task';
import { FatalableInterface } from './fatalable.interface';
import { statuses } from './status.constant';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';

@injectable()
export class AtomicTaskStrategy implements TaskStrategyInterface {
	constructor(
		@injectModel(CommonTask) private readonly CommonTaskModel: ModelType<CommonTask>,
		@inject(TaskService) private readonly taskService: TaskServiceInterface,
		@inject('Logger') private readonly logger: LoggerInterface,
		@inject(TaskMetricsService)
		private readonly taskMetricsService: TaskMetricsServiceInterface,
	) {}

	async handleTask(taskHandler: TaskHandlerInterface, task: CommonTask) {
		const startTime = Date.now();
		await this.taskService.setPending(task._id.toString());
		try {
			await taskHandler.handle(task);
			await this.taskService.finish(task._id.toString());
			this.taskMetricsService.increaseSuccess(task.__t.toString());
		} catch (_error) {
			let error: ObjectableInterface & FatalableInterface;
			if (typeof _error.toObject !== 'function') {
				error = new UnhandledTaskException(_error, task);
			} else {
				error = _error;
			}

			const userId = (task.user as User)._id.toString();

			this.logger.error({
				_error,
				message: 'Ошибка при выполнении задачи',
				errorData: error.toObject(),
				taskId: task._id.toString(),
				userId,
			});
			await this.taskService.finishWithError(task._id.toString(), error);
			this.taskMetricsService.increaseError(task.__t.toString());
			if (task.parentTaskId) {
				await this.catchFatalable(task.parentTaskId, error);
			}
		} finally {
			if (task.parentTaskId) {
				await this.updateRootTask(task.parentTaskId);
			}
			this.taskMetricsService.addDuration(task.__t.toString(), Date.now() - startTime);
		}
	}

	private async catchFatalable(
		parentTaskId: Types.ObjectId,
		error: FatalableInterface & ObjectableInterface,
	) {
		if (error.isFatal) {
			await this.taskService.skipAllSubTasks(parentTaskId);
			await this.taskService.finishWithError(parentTaskId.toString(), error);
		} else {
			await this.taskService.addSubTasksError(parentTaskId, error);
		}
	}

	private async updateRootTask(parentTaskId: Types.ObjectId) {
		await this.CommonTaskModel.update(
			{
				_id: parentTaskId,
			},
			{
				$inc: { finishedCount: 1 },
			},
		);

		const rootTask = await this.CommonTaskModel.findOne({
			_id: parentTaskId,
		});

		if (rootTask.finishedCount + rootTask.subTasksErrors.length >= rootTask.tasksCount) {
			await this.CommonTaskModel.update(
				{ _id: parentTaskId },
				{ $set: { status: statuses.finished } },
			);
		}
	}
}
