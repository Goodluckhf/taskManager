import bluebird from 'bluebird';
import TaskErrorFactory from '../api/errors/tasks/TaskErrorFactory';
import mongoose from '../../../lib/mongoose';
import BaseTask from './BaseTask';
import CheckVkUserRequest from '../api/amqpRequests/CheckVkUserRequest';

class CheckAndAddUsersTask extends BaseTask {
	constructor({ VkUser, ...args }) {
		super(args);
		this.VkUser = VkUser;
	}

	async checkAccount(login, password) {
		const rpcRequest = new CheckVkUserRequest(this.config, { login, password });
		return this.rpcClient.call(rpcRequest);
	}

	/**
	 *
	 * @param {Array<Object>} usersCredentials
	 */
	async handle({ usersCredentials }) {
		try {
			const errors = [];
			await bluebird.map(
				usersCredentials,
				async ({ login, password }) => {
					try {
						const usersCount = await this.VkUser.count({ login });
						if (usersCount > 0) {
							const error = new Error('user with such login has already exists');
							error.login = login;
							errors.push(error);
							return;
						}

						const { isActive, code } = await this.checkAccount(login, password);
						if (!isActive) {
							const error = new Error('user auth failed');
							error.login = login;
							error.code = code;
							errors.push(error);
							return;
						}

						const newUserDocument = this.VkUser.createInstance({ login, password });
						await newUserDocument.save();
					} catch (error) {
						error.login = login;
						errors.push(error);
					}
				},
				{ concurrency: 10 },
			);
			if (errors.length) {
				const taskError = new Error('errors with some checks');
				taskError.errors = errors;
				throw taskError;
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

export default CheckAndAddUsersTask;
