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
				const currentUser = users[task.userFakeId];
				const replyTo =
					typeof task.replyToCommentNumber !== 'undefined' &&
					commentResults[task.replyToCommentNumber] &&
					commentResults[task.replyToCommentNumber].commentId
						? commentResults[task.replyToCommentNumber].commentId
						: null;

				const proxy = await this.Proxy.getRandom();

				const { commentId } = await this.commentsService.create({
					credentials: {
						login: currentUser.login,
						password: currentUser.password,
					},
					postLink,
					text: task.text,
					imageURL: task.imageURL,
					replyTo,
					proxy: {
						url: proxy.url,
						login: proxy.login,
						password: proxy.password,
					},
				});

				const postId = postLink
					.replace(/.*[?&]w=wall-/, '-')
					.replace(/.*vk.com\/wall-/, '-')
					.replace(/&.*$/, '');

				this.logger.info({
					message: 'Запостили коммент',
					newCommentId: commentId,
					postLink,
					parsedPostId: postId,
				});
				if (task.likesCount > 0) {
					await this.likeService.setLikesToComment({
						count: task.likesCount,
						url: `https://vk.com/wall${postId}?reply=${commentId.replace(/.*_/, '')}`,
					});
				}

				commentResults.push({
					commentId,
				});
			}
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
