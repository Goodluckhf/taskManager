import {
	controller,
	BaseHttpController,
	principal,
	interfaces,
	httpDelete,
	requestParam,
	httpGet,
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { AuthMiddleware } from '../auth/auth.middleware';
import { User } from '../users/user';
import { TaskService } from './task.service';
import { TaskServiceInterface } from './task-service.interface';
import GracefulStop from '../../../lib/graceful-stop';
import { LoggerInterface } from '../../../lib/logger.interface';
import { ActiveTasksExecutor } from './active-tasks-executor';

@controller('/api')
export class TaskController extends BaseHttpController {
	@inject(TaskService) private readonly taskService: TaskServiceInterface;

	@inject(ActiveTasksExecutor) private readonly activeTaskExecutor: ActiveTasksExecutor;

	@inject(GracefulStop) private readonly gracefulStop: GracefulStop;

	@inject('Logger') private readonly logger: LoggerInterface;

	@httpDelete('/task/:id', AuthMiddleware)
	async createTask(
		@principal() principalUser: interfaces.Principal,
		@requestParam('id') id: string,
	) {
		return this.json(
			{
				success: true,
				data: await this.taskService.deleteOwnedByUser(principalUser.details as User, id),
			},
			200,
		);
	}

	@httpGet('/task/handleActive')
	async handleActive() {
		if (this.gracefulStop.isStopping) {
			this.logger.warn({
				message: 'method call during graceful stopping',
				method: 'TaskApi.handleActive',
			});

			return this.json(
				{
					success: true,
					data: null,
				},
				200,
			);
		}

		this.gracefulStop.setProcessing('handleActiveTasks');
		this.activeTaskExecutor
			.handleActive()
			.then(() => {
				this.gracefulStop.setReady('handleActiveTasks');
			})
			.catch(error => {
				this.logger.error({
					message: 'fatal error during handle tasks',
					error,
				});
				this.gracefulStop.setReady('handleActiveTasks');
			});

		return this.json(
			{
				success: true,
				data: null,
			},
			200,
		);
	}
}
