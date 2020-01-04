import {
	controller,
	BaseHttpController,
	principal,
	interfaces,
	httpDelete,
	requestParam,
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { AuthMiddleware } from '../auth/auth.middleware';
import { User } from '../users/user';
import { TaskService } from './task.service';
import { TaskServiceInterface } from './task-service.interface';

@controller('/api')
export class TaskController extends BaseHttpController {
	@inject(TaskService) private readonly taskService: TaskServiceInterface;

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
}
