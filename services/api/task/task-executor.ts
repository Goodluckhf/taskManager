import { inject, injectable } from 'inversify';
import { CommonTask } from './common-task';
import { TaskAbstractFactory } from './task-abstract.factory';
import { TaskAbstractFactoryInterface } from './task-abstract-factory.interface';
import { TaskService } from './task.service';
import { ObjectableInterface } from '../../../lib/internal.types';
import { UnhandledTaskException } from './unhandled-task.exception';
import { LoggerInterface } from '../../../lib/logger.interface';
import { User } from '../users/user';
import { TaskServiceInterface } from './task-service.interface';

@injectable()
export class TaskExecutor {
	constructor(
		@inject(TaskAbstractFactory)
		private readonly taskHandlerFactory: TaskAbstractFactoryInterface,
		@inject(TaskService) private readonly taskService: TaskServiceInterface,
		@inject('Logger') private readonly logger: LoggerInterface,
	) {}

	async execute(task: CommonTask) {
		const taskHandler = this.taskHandlerFactory.createTaskHandler(task.__t as string);
		await this.taskService.setPending(task._id.toString());
		try {
			await taskHandler.handle(task);
			await this.taskService.finish(task._id.toString());
		} catch (_error) {
			let error: ObjectableInterface;
			if (typeof _error.toObject !== 'function') {
				error = new UnhandledTaskException(_error);
			} else {
				error = _error;
			}

			const userId = task.user instanceof User ? task.user._id.toString() : task.user;

			this.logger.error({
				message: 'Ошибка при выполнении задачи',
				errorData: error.toObject(),
				taskId: task._id.toString(),
				userId,
			});
			await this.taskService.finishWithError(task._id.toString(), error);
		}
	}
}