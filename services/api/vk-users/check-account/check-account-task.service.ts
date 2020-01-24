import moment from 'moment';
import { injectable } from 'inversify';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { Types } from 'mongoose';
import { VkUserCredentialsInterface } from '../vk-user-credentials.interface';
import { CheckAccountTask } from './check-account-task';
import { User } from '../../users/user';
import { injectModel } from '../../../../lib/inversify-typegoose/inject-model';

type CheckAccountTaskArgument = {
	usersCredentials: VkUserCredentialsInterface;
	startAt: Date | moment.Moment;
	user: User;
	parentTaskId: Types.ObjectId;
};

@injectable()
export class CheckAccountTaskService {
	constructor(
		@injectModel(CheckAccountTask)
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

	async setSubTasksCount(id: Types.ObjectId, count: number) {
		await this.CheckAccountTaskModel.update(
			{
				_id: id,
			},
			{
				$set: { tasksCount: count },
			},
		);
	}
}
