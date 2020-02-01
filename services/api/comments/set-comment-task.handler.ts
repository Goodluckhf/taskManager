import { inject, injectable } from 'inversify';
import bluebird from 'bluebird';
import { ModelType } from '@typegoose/typegoose/lib/types';
import moment from 'moment';
import { TaskHandlerInterface } from '../task/task-handler.interface';
import { SetCommentTask } from './set-comment-task';
import { PostCommentResponse } from './post-comment.response';
import { CommentsClosedException } from './comments-closed.exception';
import { getRandom, groupIdByPostLink } from '../../../lib/helper';
import { CommentService } from './comment.service';
import { LikeService } from '../likes/like.service';
import { LoggerInterface } from '../../../lib/logger.interface';
import { VkUserService } from '../vk-users/vk-user.service';
import { GroupJoinTaskService } from '../vk-users/group-join-task.service';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { CommentsByStrategyTask } from '../comments-by-strategy/comments-by-strategy-task';
import { User } from '../users/user';
import { VkUserCredentialsInterface } from '../vk-users/vk-user-credentials.interface';
import { ConfigInterface } from '../../../config/config.interface';
import { RetriesExceededException } from './retries-exceeded.exception';
import { NoActiveUsersLeftException } from './no-active-users-left.exception';
import { CommentsTranslitReplacer } from './comments-translit-replacer';

type SetCommentWithRetryArgs = {
	taskOwnerUser: User;
	commentTask: SetCommentTask;
	rootTask: CommentsByStrategyTask;
	vkUserCredentials: VkUserCredentialsInterface;
	tryNumber?: number;
};

@injectable()
export class SetCommentTaskHandler implements TaskHandlerInterface {
	constructor(
		@injectModel(SetCommentTask)
		private readonly SetCommentTaskModel: ModelType<SetCommentTask>,
		@injectModel(CommentsByStrategyTask)
		private readonly CommentsByStrategyModel: ModelType<CommentsByStrategyTask>,
		@inject('Config') private readonly config: ConfigInterface,
		@inject(CommentService) private readonly commentsService: CommentService,
		@inject(LikeService) private readonly likeService: LikeService,
		@inject('Logger') private readonly logger: LoggerInterface,
		@inject(VkUserService) private readonly vkUserService: VkUserService,
		@inject(GroupJoinTaskService) private readonly groupJoinTaskService: GroupJoinTaskService,
		@inject(CommentsTranslitReplacer)
		private readonly commentsTranslitReplacer: CommentsTranslitReplacer,
	) {}

	buildPostLink(commonPostLink) {
		const postId = commonPostLink
			.replace(/.*[?&]w=wall-/, '-')
			.replace(/.*vk.com\/wall-/, '-')
			.replace(/&.*$/, '');

		return `https://vk.com/wall${postId}`;
	}

	async setCommentsWithRetry({
		taskOwnerUser,
		rootTask,
		commentTask,
		vkUserCredentials,
		tryNumber = 0,
	}: SetCommentWithRetryArgs): Promise<PostCommentResponse> {
		if (tryNumber > 4) {
			throw new RetriesExceededException();
		}

		try {
			const text = this.config.get('postCommentsTask.translitEnabled')
				? this.commentsTranslitReplacer.randomReplace(commentTask.text)
				: commentTask.text;

			return await this.commentsService.postComment({
				credentials: {
					login: vkUserCredentials.login,
					password: vkUserCredentials.password,
					proxy: {
						url: vkUserCredentials.proxy.url,
						login: vkUserCredentials.proxy.login,
						password: vkUserCredentials.proxy.password,
					},
				},
				postLink: this.buildPostLink(commentTask.postLink),
				text,
				imageURL: commentTask.imageURL,
				replyTo: commentTask.replyToCommentId,
			});
		} catch (error) {
			if (error.code === 'comments_closed') {
				throw new CommentsClosedException(error, commentTask.text);
			}

			if (
				error.code === 'blocked' ||
				error.code === 'login_failed' ||
				error.code === 'phone_required' ||
				error.code === 'captcha_failed'
			) {
				this.logger.warn({
					message: 'проблема с пользователем vk',
					code: error.code,
					login: vkUserCredentials.login,
				});
				await this.vkUserService.setInactive(vkUserCredentials.login, error);
				let exceptReplyToUser = null;
				if (
					typeof commentTask.replyToCommentNumber !== 'undefined' &&
					commentTask.replyToCommentNumber !== null
				) {
					const { userFakeId: userFakeIdReplyTo } = rootTask.commentsStrategy[
						commentTask.replyToCommentNumber
					];

					exceptReplyToUser = rootTask.vkUserLogins[userFakeIdReplyTo];
				}
				const newUser = await this.vkUserService.getRandom(exceptReplyToUser);
				if (!newUser) {
					throw new NoActiveUsersLeftException();
				}

				await this.groupJoinTaskService.createTask(taskOwnerUser, {
					groupId: groupIdByPostLink(commentTask.postLink),
					vkUserCredentials: newUser,
				});

				await this.CommentsByStrategyModel.update(
					{
						_id: rootTask._id,
					},
					{
						$set: { [`vkUserLogins.${commentTask.userFakeId}`]: newUser.login },
					},
				);

				rootTask = await this.CommentsByStrategyModel.findOne({
					_id: rootTask._id,
				});

				return this.setCommentsWithRetry({
					rootTask,
					taskOwnerUser,
					vkUserCredentials: newUser,
					commentTask,
					tryNumber: tryNumber + 1,
				});
			}

			if (error.code === 'proxy_failure') {
				this.logger.warn({
					message: 'проблема с прокси',
					code: error.code,
					proxy: vkUserCredentials.proxy,
				});
				await bluebird.delay(10000);

				return this.setCommentsWithRetry({
					taskOwnerUser,
					rootTask,
					vkUserCredentials,
					commentTask,
					tryNumber: tryNumber + 1,
				});
			}

			throw error;
		}
	}

	private async setLikesToComment(count: number, url: string) {
		try {
			await this.likeService.setLikesToComment({
				count,
				url,
			});
		} catch (error) {
			const errorData = typeof error.toObject === 'function' ? error.toObject() : {};
			this.logger.warn({
				message: 'Ошибка при накрутке лайков на комменты',
				error,
				errorData,
			});
		}
	}

	async handle(commentTask: SetCommentTask) {
		const rootTask = await this.CommentsByStrategyModel.findOne({
			_id: commentTask.parentTaskId,
		});

		const vkUserLogin = rootTask.vkUserLogins[commentTask.userFakeId];
		const vkUserCredentials = await this.vkUserService.getCredentialsByLogin(vkUserLogin);

		const { commentId } = await this.setCommentsWithRetry({
			rootTask,
			commentTask,
			vkUserCredentials,
			taskOwnerUser: commentTask.user as User,
		});

		if (commentTask.likesCount > 0) {
			await this.setLikesToComment(
				commentTask.likesCount,
				`${this.buildPostLink(commentTask.postLink)}?reply=${commentId.replace(/.*_/, '')}`,
			);
		}
		const commentsReplyToThis = rootTask.commentsStrategy.filter(strategy => {
			return strategy.replyToCommentNumber === commentTask.commentIndex;
		});

		const startMoment = moment().add(
			getRandom(0, this.config.get('postCommentsTask.distribution.replyMax')),
			's',
		);
		await bluebird.map(
			commentsReplyToThis,
			async commentStrategy => {
				const newCommentsTask = new this.SetCommentTaskModel();
				newCommentsTask.parentTaskId = commentTask.parentTaskId;
				newCommentsTask.user = commentTask.user;
				newCommentsTask.text = commentStrategy.text;
				newCommentsTask.imageURL = commentStrategy.imageURL;
				newCommentsTask.postLink = commentTask.postLink;
				newCommentsTask.likesCount = commentStrategy.likesCount;
				newCommentsTask.commentIndex = commentStrategy.commentIndex;
				newCommentsTask.userFakeId = commentStrategy.userFakeId;
				newCommentsTask.startAt = moment(startMoment);
				newCommentsTask.replyToCommentId = commentId;
				await newCommentsTask.save();

				startMoment.add(
					getRandom(0, this.config.get('postCommentsTask.distribution.commonMax')),
					's',
				);
			},
			{ concurrency: 1 },
		);
	}
}
