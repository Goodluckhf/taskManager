import { ModelType } from '@typegoose/typegoose/lib/types';
import { inject, injectable } from 'inversify';
import moment from 'moment';
import bluebird from 'bluebird';
import { GroupJoinTaskInterface } from './group-join-task.interface';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { JoinToGroupTask } from './join-to-group.task';
import { VkUserService } from './vk-user.service';
import { User } from '../users/user';
import { getRandom, groupIdForApi } from '../../../lib/helper';
import { GroupJoinDto } from './dto/group-join.dto';
import { statuses } from '../task/status.constant';
import { LoggerInterface } from '../../../lib/logger.interface';

type TaskDistribution = {
	min?: number;
	max?: number;
};

@injectable()
export class GroupJoinTaskService {
	constructor(
		@injectModel(JoinToGroupTask)
		private readonly JoinToGroupTaskModel: ModelType<JoinToGroupTask>,
		@inject(VkUserService)
		private readonly vkUserService: VkUserService,
		@inject('Logger') private readonly logger: LoggerInterface,
	) {}

	async createTask(user: User, groupJoinTaskData: GroupJoinTaskInterface & TaskDistribution) {
		if (
			await this.vkUserService.hasUserJoinedGroup(
				groupJoinTaskData.vkUserCredentials,
				groupJoinTaskData.groupId,
			)
		) {
			return;
		}

		const taskCount = await this.JoinToGroupTaskModel.count({
			groupId: groupIdForApi(groupJoinTaskData.groupId).toString(),
			$or: [{ status: statuses.waiting }, { status: statuses.pending }],
			'vkUserCredentials.login': groupJoinTaskData.vkUserCredentials.login,
		});

		if (taskCount > 0) {
			return;
		}

		const task = new this.JoinToGroupTaskModel();
		task.groupId = groupIdForApi(groupJoinTaskData.groupId).toString();
		task.vkUserCredentials = groupJoinTaskData.vkUserCredentials;
		// От 0 => 10 минут
		const randomSeconds = getRandom(
			groupJoinTaskData.min || 0,
			groupJoinTaskData.max || 10 * 60,
		);
		task.startAt = moment().add(randomSeconds, 's');
		task.user = user;
		await task.save();
	}

	async createTasksForAllUsers(user: User, groupJoinDto: GroupJoinDto) {
		const allActiveUsers = await this.vkUserService.getAllActive();

		await bluebird.map(
			allActiveUsers,
			async vkUser => {
				try {
					await this.createTask(user, {
						vkUserCredentials: vkUser,
						groupId: groupJoinDto.groupId,
						max: 20,
					});
				} catch (error) {
					this.logger.error({
						message: 'Ошбика при создании задачи на вступления в группу',
						error,
						vkUserCredentials: vkUser,
						...groupJoinDto,
					});
				}
			},
			{ concurrency: 20 },
		);
	}
}
