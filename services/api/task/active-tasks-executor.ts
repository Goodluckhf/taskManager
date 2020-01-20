import { inject, injectable } from 'inversify';
import bluebird from 'bluebird';
import { TaskService } from './task.service';
import { TaskServiceInterface } from './task-service.interface';
import { TaskExecutor } from './task-executor';
import { LoggerInterface } from '../../../lib/logger.interface';
import { ConfigInterface } from '../../../config/config.interface';

@injectable()
export class ActiveTasksExecutor {
	constructor(
		@inject(TaskService) private readonly taskService: TaskServiceInterface,
		@inject(TaskExecutor) private readonly taskExecutor: TaskExecutor,
		@inject('Logger') private readonly logger: LoggerInterface,
		@inject('Config') private readonly config: ConfigInterface,
	) {}

	async handleActive() {
		const tasks = await this.taskService.getActive(
			parseInt(this.config.get('cron.tasksPrefetch'), 10),
		);

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
