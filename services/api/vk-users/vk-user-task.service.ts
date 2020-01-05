import { inject, injectable } from 'inversify';
import { ModelType } from '@typegoose/typegoose/lib/types';
import moment from 'moment';
import { plainToClass } from 'class-transformer';
import { VkUserService } from './vk-user.service';
import { TaskCreationDto } from './task-creation.dto';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { CheckAndAddUserTask } from './check-and-add-user.task';
import { User } from '../users/user';

@injectable()
export class VkUserTaskService {
	constructor(
		@inject(VkUserService) private readonly vkUserService: VkUserService,
		@injectModel(CheckAndAddUserTask)
		private readonly CheckAndAddUserTaskModel: ModelType<CheckAndAddUserTask>,
	) {}

	async createTask(user: User, dto: TaskCreationDto): Promise<CheckAndAddUserTask> {
		const newTask = new this.CheckAndAddUserTaskModel();
		newTask.usersCredentials = dto.usersCredentials;
		newTask.user = user;
		newTask.createdAt = moment();
		await newTask.save();
		return plainToClass(CheckAndAddUserTask, newTask.toObject());
	}
}
