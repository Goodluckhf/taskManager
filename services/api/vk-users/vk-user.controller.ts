import {
	BaseHttpController,
	controller,
	httpGet,
	httpPost,
	interfaces,
	principal,
	requestBody,
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AuthMiddleware } from '../auth/auth.middleware';
import { VkUserService } from './vk-user.service';
import { TaskCreationDto } from './dto/task-creation.dto';
import { ValidationException } from '../exceptions/validation.exception';
import { VkUserTaskService } from './vk-user-task.service';
import { User } from '../users/user';
import { GroupJoinDto } from './dto/group-join.dto';
import { GroupJoinTaskService } from './group-join-task.service';
import { tagsEnum } from './tags-enum.constant';

@controller('/api')
export class VkUserController extends BaseHttpController {
	@inject(VkUserService) private readonly vkUserService: VkUserService;

	@inject(VkUserTaskService) private readonly vkUserTaskService: VkUserTaskService;

	@inject(GroupJoinTaskService) private readonly groupJoinTaskService: GroupJoinTaskService;

	@httpGet('/vk-users/active', AuthMiddleware)
	async getActiveCount() {
		return this.json(
			{
				success: true,
				data: await this.vkUserService.countActive([tagsEnum.female, tagsEnum.complete]),
			},
			200,
		);
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

	@httpPost('/vk-users-task/all', AuthMiddleware)
	async createCheckAllUsersTask(@principal() principalUser: interfaces.Principal) {
		return this.json(
			{
				success: true,
				data: await this.vkUserTaskService.createCheckAllUsersTask(
					principalUser.details as User,
				),
			},
			200,
		);
	}

	@httpPost('/vk-users/join', AuthMiddleware)
	async joinToGroup(@principal() principalUser: interfaces.Principal, @requestBody() dto: any) {
		const groupJoinDto = plainToClass(GroupJoinDto, dto);
		const errors = validateSync(groupJoinDto, { validationError: { target: false } });
		if (errors.length > 0) {
			throw new ValidationException(errors);
		}

		return this.json(
			{
				success: true,
				data: await this.groupJoinTaskService.createTasksForAllUsers(
					principalUser.details as User,
					groupJoinDto,
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
