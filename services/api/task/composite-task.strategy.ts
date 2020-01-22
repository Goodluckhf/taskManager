import { inject, injectable } from 'inversify';
import { TaskStrategyInterface } from './task-strategy.interface';
import { TaskHandlerInterface } from './task-handler.interface';
import { CommonTask } from './common-task';
import { TaskService } from './task.service';
import { TaskServiceInterface } from './task-service.interface';
import { LoggerInterface } from '../../../lib/logger.interface';
import { ObjectableInterface } from '../../../lib/internal.types';
import { UnhandledTaskException } from './unhandled-task.exception';
import { User } from '../users/user';

@injectable()
export class CompositeTaskStrategy implements TaskStrategyInterface {
	constructor(
		@inject(TaskService) private readonly taskService: TaskServiceInterface,
		@inject('Logger') private readonly logger: LoggerInterface,
	) {}

	async handleTask(taskHandler: TaskHandlerInterface, task: CommonTask) {
		await this.taskService.setPending(task._id.toString());
		try {
			await taskHandler.handle(task);
		} catch (_error) {
			let error: ObjectableInterface;
			if (typeof _error.toObject !== 'function') {
				error = new UnhandledTaskException(_error);
			} else {
				error = _error;
			}

			const userId = (task.user as User)._id.toString();

			this.logger.error({
				message: 'Ошибка при создании композиции задач',
				errorData: error.toObject(),
				taskId: task._id.toString(),
				userId,
			});
			await this.taskService.finishWithError(task._id.toString(), error);
		}
	}
}
