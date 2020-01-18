import { ModelType } from '@typegoose/typegoose/lib/types';
import { inject, injectable } from 'inversify';
import moment from 'moment';
import { GroupJoinTaskInterface } from './group-join-task.interface';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { JoinToGroupTask } from './join-to-group.task';
import { VkUserService } from './vk-user.service';
import { User } from '../users/user';
import { getRandom } from '../../../lib/helper';

@injectable()
export class GroupJoinTaskService {
	constructor(
		@injectModel(JoinToGroupTask)
		private readonly JoinToGroupTaskModel: ModelType<JoinToGroupTask>,
		@inject(VkUserService)
		private readonly vkUserService: VkUserService,
	) {}

	async createTask(user: User, groupJoinTaskData: GroupJoinTaskInterface) {
		if (
			await this.vkUserService.hasUserJoinedGroup(
				groupJoinTaskData.vkUserCredentials,
				groupJoinTaskData.groupId,
			)
		) {
			return;
		}

		const task = new this.JoinToGroupTaskModel();
		task.groupId = groupJoinTaskData.groupId;
		task.vkUserCredentials = groupJoinTaskData.vkUserCredentials;
		// От 0 => 7 минут
		const randomSeconds = getRandom(0, 7 * 60);
		task.startAt = moment().add(randomSeconds, 's');
		task.user = user;
		await task.save();
	}
}
