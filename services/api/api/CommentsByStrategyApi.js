import mongoose from 'mongoose';
import moment from 'moment';
import BaseApi from './BaseApi';
import BillingAccount from '../billing/BillingAccount';
import { UserIsNotReady } from './errors';

class CommentsByStrategyApi extends BaseApi {
	/**
	 * @param {BaseAccount} account
	 * @param {Object} data
	 */
	async create(account, data) {
		if (account instanceof BillingAccount) {
			throw new UserIsNotReady(['admin']);
		}

		const CommentsByStrategyModel = mongoose.model('CommentsByStrategyTask');
		this.validate(
			{
				properties: {
					postLink: { type: 'string' },
					comments: {
						type: 'array',
						items: {
							properties: {
								userFakeId: { type: 'number' },
								replyToCommentNumber: { type: 'number' },
								text: { type: 'string' },
								imageURL: { type: 'string' },
								likesCount: { type: 'number', default: 0 },
							},
							required: ['userFakeId', 'text'],
						},
					},
				},
				required: ['postLink', 'comments'],
			},
			data,
		);

		const taskDocument = CommentsByStrategyModel.createInstance({
			postLink: data.postLink,
			commentsStrategy: data.comments,
			startAt: moment(),
			user: account.user,
		});

		await taskDocument.save();
	}

	/**
	 * @description Возвращает список задач
	 * @property {UserDocument} user
	 * @return {Promise.<Array.<CommentsByStrategyTask>>}
	 */
	async list(user) {
		const CommentsByStrategyTask = mongoose.model('CommentsByStrategyTask');

		const activeTasks = await CommentsByStrategyTask.find({
			user,
			$or: [
				{ status: CommentsByStrategyTask.status.waiting },
				{ status: CommentsByStrategyTask.status.pending },
			],
		})
			.sort({ createdAt: -1 })
			.lean()
			.exec();

		const lastInactiveTasks = await CommentsByStrategyTask.find({
			user,
			$or: [
				{ status: CommentsByStrategyTask.status.skipped },
				{ status: CommentsByStrategyTask.status.finished },
			],
		})
			.sort({ createdAt: -1 })
			.limit(10)
			.lean()
			.exec();

		return [...activeTasks, ...lastInactiveTasks];
	}
}

export default CommentsByStrategyApi;
