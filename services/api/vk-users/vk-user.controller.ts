import {
	BaseHttpController,
	controller,
	httpGet,
	httpPost,
	requestBody,
	principal,
	interfaces,
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AuthMiddleware } from '../auth/auth.middleware';
import { VkUserService } from './vk-user.service';
import { TaskCreationDto } from './task-creation.dto';
import { ValidationException } from '../exceptions/validation.exception';
import { VkUserTaskService } from './vk-user-task.service';
import { User } from '../users/user';

@controller('/api')
export class VkUserController extends BaseHttpController {
	@inject(VkUserService) private readonly vkUserService: VkUserService;

	@inject(VkUserTaskService) private readonly vkUserTaskService: VkUserTaskService;

	@httpGet('/vk-users/active', AuthMiddleware)
	async getActiveCount() {
		return this.json({ success: true, data: await this.vkUserService.countActive() }, 200);
	}

	@httpPost('/vk-users-task', AuthMiddleware)
	async create(@principal() principalUser: interfaces.Principal, @requestBody() dto: any) {
		const taskCreationDto = plainToClass(TaskCreationDto, dto);
		const errors = validateSync(taskCreationDto, { validationError: { target: false } });
		if (errors.length > 0) {
			throw new ValidationException(errors);
		}

		return this.json(
			{
				success: true,
				data: await this.vkUserTaskService.createTask(
					principalUser.details as User,
					taskCreationDto,
				),
			},
			200,
		);
	}

	@httpGet('/vk-users-tasks', AuthMiddleware)
	async getTasks(@principal() principalUser: interfaces.Principal) {
		return this.json(
			{
				success: true,
				data: await this.vkUserTaskService.getTasksForUser(principalUser.details as User),
			},
			200,
		);
	}
}
