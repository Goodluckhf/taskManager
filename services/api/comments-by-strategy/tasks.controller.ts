import { ControllerInterface } from '../../../lib/framework/controller.interface';
import { Post, Use } from '../../../lib/framework/controller.decorator';
import { AuthMiddleware } from '../auth/auth.middleware';

export class TasksController implements ControllerInterface {
	@Post('/comments-by-strategy')
	@Use(AuthMiddleware)
	async createTask() {}
}
