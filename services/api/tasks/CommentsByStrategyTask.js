import { uniqBy } from 'lodash';
import TaskErrorFactory from '../api/errors/tasks/TaskErrorFactory';
import mongoose from '../../../lib/mongoose';
import BaseTask from './BaseTask';

class CommentsByStrategyTask extends BaseTask {
	constructor({ VkUser, Proxy, commentsService, likeService, ...args }) {
		super(args);
		this.VkUser = VkUser;
		this.Proxy = Proxy;
		this.commentsService = commentsService;
		this.likeService = likeService;
	}

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
	}) {
		if (tryNumber > 2) {
			throw new Error('retries exceed');
		}
		const currentUser = users[task.userFakeId];

		try {
			return await this.commentsService.create({
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
				error.code === 'phone_required'
			) {
				this.logger.warn({
					message: 'проблема с пользователем vk',
					code: error.code,
					login: currentUser.login,
				});
				await this.VkUser.setInactive(currentUser.login, error);
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
				const newUser = await this.VkUser.getRandom(exceptReplyToUser);
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
					tryNumber: tryNumber + 1,
				});
			}

			if (error.code === 'proxy_failure') {
				this.logger.warn({
					message: 'проблема с прокси',
					code: error.code,
					proxy,
				});
				await this.Proxy.setInactive(proxy.url, error);
				const newProxy = await this.Proxy.getRandom();

				return this.setCommentsWithRetry({
					users,
					task,
					replyTo,
					postLink,
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
	async handle({ postLink, commentsStrategy: strategy }) {
		// @TODO: добавить валидацию
		// @TODO: Добавить чекалку ссылки на блок
		try {
			const accountsLength = uniqBy(strategy, item => item.userFakeId).length;
			const users = await this.VkUser.findActive(accountsLength);
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

				const proxy = await this.Proxy.getRandom();

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
					await this.likeService.setLikesToComment({
						count: task.likesCount,
						url: `${this.buildPostLink(postLink)}?reply=${commentId.replace(
							/.*_/,
							'',
						)}`,
					});
				}

				commentResults.push({
					commentId,
					userFakeId: task.userFakeId,
				});
			}

			this.logger.info({
				message: 'Задача выполенена',
				taskId: this.taskDocument.id,
			});
		} catch (error) {
			const wrappedError = TaskErrorFactory.createError('default', error);

			this.taskDocument._error = wrappedError.toObject();
			throw wrappedError;
		} finally {
			const Task = mongoose.model('Task');
			this.taskDocument.lastHandleAt = new Date();
			this.taskDocument.status = Task.status.finished;
			await this.taskDocument.save();
		}
	}
}

export default CommentsByStrategyTask;
