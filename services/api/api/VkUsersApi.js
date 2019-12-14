import mongoose from 'mongoose';
import moment from 'moment';
import BaseApi from './BaseApi';
import BillingAccount from '../billing/BillingAccount';
import { UserIsNotReady } from './errors';

class VkUsersApi extends BaseApi {
	/**
	 * @param {BaseAccount} account
	 * @param {Object} data
	 */
	async createTask(account, data) {
		if (account instanceof BillingAccount) {
			throw new UserIsNotReady(['admin']);
		}

		const CheckAndAddUsersTaskModel = mongoose.model('CheckAndAddUsersTask');
		this.validate(
			{
				properties: {
					usersCredentials: {
						type: 'array',
						items: {
							properties: {
								login: { type: 'string' },
								password: { type: 'string' },
							},
							required: ['login', 'password'],
						},
					},
				},
				required: ['usersCredentials'],
			},
			data,
		);

		const taskDocument = CheckAndAddUsersTaskModel.createInstance({
			usersCredentials: data.usersCredentials,
			startAt: moment(),
			user: account.user,
		});

		await taskDocument.save();
		return taskDocument.toObject();
	}

	/**
	 * @description Возвращает список задач
	 * @property {UserDocument} user
	 * @return {Promise.<Array.<CommentsByStrategyTask>>}
	 */
	async listTask(user) {
		const CheckAndAddUsersTask = mongoose.model('CheckAndAddUsersTask');
		const query = { deletedAt: null, user };
		const activeTasks = await CheckAndAddUsersTask.find({
			...query,
			$or: [
				{ status: CheckAndAddUsersTask.status.waiting },
				{ status: CheckAndAddUsersTask.status.pending },
			],
		})
			.sort({ createdAt: -1 })
			.lean()
			.exec();

		const lastInactiveTasks = await CheckAndAddUsersTask.find({
			...query,
			$or: [
				{ status: CheckAndAddUsersTask.status.skipped },
				{ status: CheckAndAddUsersTask.status.finished },
			],
		})
			.sort({ createdAt: -1 })
			.limit(10)
			.lean()
			.exec();

		return [...activeTasks, ...lastInactiveTasks];
	}

	async getActiveUsersCount() {
		const VkUserModel = mongoose.model('VkUser');
		return VkUserModel.countActive();
	}
}

export default VkUsersApi;
