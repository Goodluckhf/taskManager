import { inject, injectable } from 'inversify';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { shuffle } from 'lodash';
import moment from 'moment';
import bluebird from 'bluebird';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { CommentComplainTask } from './comment-complain-task';
import { User } from '../users/user';
import { VkUserService } from '../vk-users/vk-user.service';
import { ConfigInterface } from '../../../config/config.interface';
import { getRandom } from '../../../lib/helper';
import { CommentComplainCreationDto } from './comment-complain-creation.dto';

@injectable()
export class CommentComplainTaskService {
	constructor(
		@injectModel(CommentComplainTask)
		private readonly CommentComplainTaskModel: ModelType<CommentComplainTask>,
		@inject(VkUserService) private readonly vkUserService: VkUserService,
		@inject('Config') private readonly config: ConfigInterface,
	) {}

	async createTasks(user: User, dto: CommentComplainCreationDto) {
		const allActiveUsers = await this.vkUserService.getAllActive();
		const usersForTask = shuffle(allActiveUsers).slice(
			0,
			allActiveUsers.length * this.config.get('commentComplainTask.usersRatio'),
		);

		const secondsDistributionTop =
			(usersForTask.length / 60) * this.config.get('commentComplainTask.tasksPerMinute');

		await bluebird.map(
			usersForTask,
			async vkUser => {
				const newTask = new this.CommentComplainTaskModel();
				newTask.user = user;
				newTask.login = vkUser.login;
				newTask.commentLink = dto.commentLink;
				newTask.startAt = moment().add(getRandom(0, secondsDistributionTop), 's');
				await newTask.save();
			},
			{ concurrency: 10 },
		);
	}
}
