import { uniqBy } from 'lodash';

class CommentsByStrategyTask {
	constructor({ VkUserModel, commentsService, likeService }) {
		this.VkUser = VkUserModel;
		this.commentsService = commentsService;
		this.likeService = likeService;
	}

	/**
	 *
	 * @param {string} postLink
	 * @param {string} rawStrategy
	 */
	async handle({ postLink, strategy }) {
		// @TODO: добавить валидацию
		// @TODO: Добавить чекалку ссылки на блок
		const accountsLength = uniqBy(strategy.items, item => item.userFakeId).length;
		const users = await this.VkUser.findActive(accountsLength);
		if (users.length < accountsLength) {
			throw new Error('There is not enough accounts');
		}

		const commentResults = [];

		for (const task of strategy.items) {
			const currentUser = users[task.userFakeId];
			const replyTo =
				typeof task.replyToCommentNumber !== 'undefined' &&
				commentResults[task.replyToCommentNumber] &&
				commentResults[task.replyToCommentNumber].commentId
					? commentResults[task.replyToCommentNumber].commentId
					: null;

			const { commentId } = await this.commentsService.create({
				credentials: {
					login: currentUser.login,
					password: currentUser.password,
				},
				postLink,
				text: task.text,
				imageURL: task.imageURL,
				replyTo,
			});

			if (task.likesCount > 0) {
				await this.likeService.setLikesToComment({
					count: task.likesCount,
					url: `${postLink}?reply=${commentId}`,
				});
			}

			commentResults.push({
				commentId,
			});
		}
	}
}

export default CommentsByStrategyTask;
