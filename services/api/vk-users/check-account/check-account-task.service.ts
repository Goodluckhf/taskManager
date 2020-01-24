import moment from 'moment';
import { inject, injectable } from 'inversify';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { Types } from 'mongoose';
import { VkUserCredentialsInterface } from '../vk-user-credentials.interface';
import { CheckAccountTask } from './check-account-task';
import { User } from '../../users/user';

type CheckAccountTaskArgument = {
	usersCredentials: VkUserCredentialsInterface;
	startAt: Date | moment.Moment;
	user: User;
	parentTaskId: Types.ObjectId;
};

@injectable()
export class CheckAccountTaskService {
	constructor(
		@inject(CheckAccountTask)
		private readonly CheckAccountTaskModel: ModelType<CheckAccountTask>,
	) {}

	async createTask(creationDto: CheckAccountTaskArgument) {
		const newTask = new this.CheckAccountTaskModel();
		newTask.usersCredentials = creationDto.usersCredentials;
		newTask.startAt = creationDto.startAt;
		newTask.user = creationDto.user;
		newTask.parentTaskId = creationDto.parentTaskId;
		await newTask.save();
	}
}
