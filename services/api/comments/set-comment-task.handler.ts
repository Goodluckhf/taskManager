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
import { ProxyService } from '../proxies/proxy.service';
import { GroupJoinTaskService } from '../vk-users/group-join-task.service';
import { injectModel } from '../../../lib/inversify-typegoose/inject-model';
import { CommentsByStrategyTask } from '../comments-by-strategy/comments-by-strategy-task';
import { User } from '../users/user';
import { VkUserCredentialsInterface } from '../vk-users/vk-user-credentials.interface';
import { ProxyInterface } from '../proxies/proxy.interface';
import { ConfigInterface } from '../../../config/config.interface';
import { statuses } from '../task/status.constant';
import { RetriesExceededException } from './retries-exceeded.exception';
import { NoActiveUsersLeftException } from './no-active-users-left.exception';

type SetCommentWithRetryArgs = {
	taskOwnerUser: User;
	commentTask: SetCommentTask;
	rootTask: CommentsByStrategyTask;
	vkUserCredentials: VkUserCredentialsInterface;
	proxy: ProxyInterface;
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
		@inject(ProxyService) private readonly proxyService: ProxyService,
		@inject(GroupJoinTaskService) private readonly groupJoinTaskService: GroupJoinTaskService,
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
		proxy,
		tryNumber = 0,
	}: SetCommentWithRetryArgs): Promise<PostCommentResponse> {
		if (tryNumber > 4) {
			throw new RetriesExceededException();
		}

		try {
			return await this.commentsService.postComment({
				credentials: {
					login: vkUserCredentials.login,
					password: vkUserCredentials.password,
				},
				postLink: this.buildPostLink(commentTask.postLink),
				text: commentTask.text,
				imageURL: commentTask.imageURL,
				replyTo: commentTask.replyToCommentId,
				proxy: {
					url: proxy.url,
					login: proxy.login,
					password: proxy.password,
				},
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
					proxy,
					tryNumber: tryNumber + 1,
				});
			}

			if (error.code === 'proxy_failure') {
				this.logger.warn({
					message: 'проблема с прокси',
					code: error.code,
					proxy,
				});
				await this.proxyService.setInactive(proxy.url, error);
				const newProxy = await this.proxyService.getRandom();

				return this.setCommentsWithRetry({
					taskOwnerUser,
					rootTask,
					vkUserCredentials,
					commentTask,
					proxy: newProxy,
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
		const proxy = await this.proxyService.getRandom();
		const vkUserLogin = rootTask.vkUserLogins[commentTask.userFakeId];
		const vkUserCredentials = await this.vkUserService.getCredentialsByLogin(vkUserLogin);

		const { commentId } = await this.setCommentsWithRetry({
			rootTask,
			commentTask,
			vkUserCredentials,
			proxy,
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
			getRandom(
				this.config.get('postCommentsTask.distribution.min'),
				this.config.get('postCommentsTask.distribution.max'),
			),
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
					getRandom(
						this.config.get('postCommentsTask.distribution.min'),
						this.config.get('postCommentsTask.distribution.max'),
					),
					's',
				);
			},
			{ concurrency: 1 },
		);
	}
}