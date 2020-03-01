import { inject, injectable } from 'inversify';
import { uniqBy } from 'lodash';
import bluebird from 'bluebird';
import { ModelType } from '@typegoose/typegoose/lib/types';
import moment from 'moment';
import { TaskHandlerInterface } from '../task/task-handler.interface';
import { LoggerInterface } from '../../../lib/logger.interface';
import { VkUserService } from '../vk-users/vk-user.service';
import { CommentsByStrategyTask } from './comments-by-strategy-task';
import { GroupJoinTaskService } from '../vk-users/group-join-task.service';
import { User } from '../users/user';
import { getRandom, groupIdByPostLink } from '../../../lib/helper';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { SetCommentTask } from '../comments/set-comment-task';
import { ConfigInterface } from '../../../config/config.interface';
import { tagsEnum } from '../vk-users/tags-enum.constant';

@injectable()
export class CommentsByStrategyTaskHandler implements TaskHandlerInterface {
	constructor(
		@injectModel(CommentsByStrategyTask)
		private readonly CommentsByStrategyModel: ModelType<CommentsByStrategyTask>,
		@injectModel(SetCommentTask)
		private readonly SetCommentTaskModel: ModelType<SetCommentTask>,
		@inject('Config') private readonly config: ConfigInterface,
		@inject('Logger') private readonly logger: LoggerInterface,
		@inject(VkUserService) private readonly vkUserService: VkUserService,
		@inject(GroupJoinTaskService) private readonly groupJoinTaskService: GroupJoinTaskService,
	) {}

	/**
	 *
	 * @param {string} postLink
	 * @param {string} rawStrategy
	 */
	async handle({ postLink, commentsStrategy: strategy, user, _id }: CommentsByStrategyTask) {
		const accountsLength = uniqBy(strategy, item => item.userFakeId).length;
		const vkUsers = await this.vkUserService.findActive(accountsLength, [
			tagsEnum.complete,
			tagsEnum.female,
		]);
		if (vkUsers.length < accountsLength) {
			throw new Error(`There is not enough accounts | need: ${accountsLength}`);
		}

		const vkUserLogins = vkUsers.map(vkUser => vkUser.login);
		await this.CommentsByStrategyModel.update(
			{
				_id,
			},
			{ $set: { vkUserLogins } },
		);

		await bluebird.map(vkUsers, vkUser =>
			this.groupJoinTaskService.createTask(user as User, {
				vkUserCredentials: vkUser,
				groupId: groupIdByPostLink(postLink),
			}),
		);

		const startMoment = moment();
		let commentsCount = 0;
		await bluebird.map(
			strategy,
			async task => {
				commentsCount += 1;
				if (task.replyToCommentNumber !== null) {
					return;
				}

				const newCommentsTask = new this.SetCommentTaskModel();
				newCommentsTask.parentTaskId = _id;
				newCommentsTask.text = task.text;
				newCommentsTask.imageURL = task.imageURL;
				newCommentsTask.postLink = postLink;
				newCommentsTask.likesCount = task.likesCount;
				newCommentsTask.commentIndex = task.commentIndex;
				newCommentsTask.userFakeId = task.userFakeId;
				newCommentsTask.user = user;
				newCommentsTask.startAt = moment(startMoment);
				await newCommentsTask.save();
				const extraSeconds = getRandom(
					0,
					this.config.get('postCommentsTask.distribution.commonMax'),
				);

				if (
					commentsCount >
					this.config.get('postCommentsTask.distribution.countWithoutDelay')
				) {
					startMoment.add(extraSeconds, 's');
				} else {
					startMoment.add(extraSeconds / 5, 's');
				}
			},
			{ concurrency: 1 },
		);
	}
}
