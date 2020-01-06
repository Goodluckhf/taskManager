import { inject, injectable } from 'inversify';
import bluebird from 'bluebird';
import { TaskService } from './task.service';
import { TaskServiceInterface } from './task-service.interface';
import { TaskExecutor } from './task-executor';
import { LoggerInterface } from '../../../lib/logger.interface';

@injectable()
export class ActiveTasksExecutor {
	constructor(
		@inject(TaskService) private readonly taskService: TaskServiceInterface,
		@inject(TaskExecutor) private readonly taskExecutor: TaskExecutor,
		@inject('Logger') private readonly logger: LoggerInterface,
	) {}

	async handleActive() {
		const tasks = await this.taskService.getActive();

		await bluebird.map(tasks, async task => {
			try {
				await this.taskExecutor.execute(task);
			} catch (error) {
				this.logger.error({
					message: 'unhandled error in task',
					taskId: task._id.toString(),
					error,
				});
			}
		});
	}
}
