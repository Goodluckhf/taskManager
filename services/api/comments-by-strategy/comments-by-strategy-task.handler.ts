import { inject, injectable } from 'inversify';
import { uniqBy } from 'lodash';
import { TaskHandlerInterface } from '../task/task-handler.interface';
import { CommentService } from '../comments/comment.service';
import { LoggerInterface } from '../../../lib/logger.interface';
import { VkUserService } from '../vk-users/vk-user.service';
import { ProxyService } from '../proxies/proxy.service';
import { LikeService } from '../likes/like.service';
import { CommentsByStrategyTask } from './comments-by-strategy-task';
import { PostCommentResponse } from '../comments/post-comment.response';

@injectable()
export class CommentsByStrategyTaskHandler implements TaskHandlerInterface {
	constructor(
		@inject(CommentService) private readonly commentsService: CommentService,
		@inject(LikeService) private readonly likeService: LikeService,
		@inject('Logger') private readonly logger: LoggerInterface,
		@inject(VkUserService) private readonly vkUserService: VkUserService,
		@inject(ProxyService) private readonly proxyService: ProxyService,
	) {}

	buildPostLink(commonPostLink) {
		const postId = commonPostLink
			.replace(/.*[?&]w=wall-/, '-')
			.replace(/.*vk.com\/wall-/, '-')
			.replace(/&.*$/, '');

		return `https://vk.com/wall${postId}`;
	}

	async setCommentsWithRetry({
		postLink,
		task,
		replyTo,
		proxy,
		users,
		commentResults,
		tryNumber = 0,
	}): Promise<PostCommentResponse> {
		if (tryNumber > 4) {
			throw new Error('retries exceed');
		}
		const currentUser = users[task.userFakeId];

		try {
			return await this.commentsService.postComment({
				credentials: {
					login: currentUser.login,
					password: currentUser.password,
				},
				postLink: this.buildPostLink(postLink),
				text: task.text,
				imageURL: task.imageURL,
				replyTo,
				proxy: {
					url: proxy.url,
					login: proxy.login,
					password: proxy.password,
				},
			});
		} catch (error) {
			if (
				error.code === 'blocked' ||
				error.code === 'login_failed' ||
				error.code === 'phone_required' ||
				error.code === 'captcha_failed'
			) {
				this.logger.warn({
					message: 'проблема с пользователем vk',
					code: error.code,
					login: currentUser.login,
				});
				await this.vkUserService.setInactive(currentUser.login, error);
				let exceptReplyToUser = null;
				if (
					typeof task.replyToCommentNumber !== 'undefined' &&
					task.replyToCommentNumber !== null
				) {
					const { userFakeId: userFakeIdReplyTo } = commentResults[
						task.replyToCommentNumber
					];

					exceptReplyToUser = users[userFakeIdReplyTo];
				}
				const newUser = await this.vkUserService.getRandom(exceptReplyToUser);
				if (!newUser) {
					throw new Error('There is no actual users left');
				}

				users[task.userFakeId] = newUser;
				return this.setCommentsWithRetry({
					users,
					task,
					replyTo,
					postLink,
					proxy,
					commentResults,
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
					users,
					task,
					replyTo,
					postLink,
					commentResults,
					proxy: newProxy,
					tryNumber: tryNumber + 1,
				});
			}

			throw error;
		}
	}

	/**
	 *
	 * @param {string} postLink
	 * @param {string} rawStrategy
	 */
	async handle({ postLink, commentsStrategy: strategy }: CommentsByStrategyTask) {
		const accountsLength = uniqBy(strategy, item => item.userFakeId).length;
		const users = await this.vkUserService.findActive(accountsLength);
		if (users.length < accountsLength) {
			throw new Error(`There is not enough accounts | need: ${accountsLength}`);
		}

		const commentResults = [];

		for (const task of strategy) {
			const replyTo =
				typeof task.replyToCommentNumber !== 'undefined' &&
				task.replyToCommentNumber !== null &&
				commentResults[task.replyToCommentNumber] &&
				commentResults[task.replyToCommentNumber].commentId
					? commentResults[task.replyToCommentNumber].commentId
					: null;

			const proxy = await this.proxyService.getRandom();

			const { commentId } = await this.setCommentsWithRetry({
				proxy,
				postLink,
				replyTo,
				task,
				users,
				commentResults,
			});

			this.logger.info({
				message: 'Запостили коммент',
				newCommentId: commentId,
				postLink,
			});

			if (task.likesCount > 0) {
				await this.setLikesToComment(
					task.likesCount,
					`${this.buildPostLink(postLink)}?reply=${commentId.replace(/.*_/, '')}`,
				);
			}

			commentResults.push({
				commentId,
				userFakeId: task.userFakeId,
			});
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
}
