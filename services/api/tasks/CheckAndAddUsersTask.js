import bluebird from 'bluebird';
import TaskErrorFactory from '../api/errors/tasks/TaskErrorFactory';
import mongoose from '../../../lib/mongoose';
import BaseTask from './BaseTask';
import CheckVkUserRequest from '../api/amqpRequests/CheckVkUserRequest';
import { CheckVkUserError } from '../api/errors/tasks';
import BaseTaskError from '../api/errors/tasks/BaseTaskError';

class CheckAndAddUsersTask extends BaseTask {
	constructor({ VkUser, Proxy, ...args }) {
		super(args);
		this.VkUser = VkUser;
		this.Proxy = Proxy;
	}

	async checkAccount(login, password, proxy) {
		const rpcRequest = new CheckVkUserRequest(this.config, {
			login,
			password,
			proxy: { url: proxy.url, login: proxy.login, password: proxy.password },
		});
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

						const proxy = await this.Proxy.getRandom();

						const { isActive, code } = await this.checkAccount(login, password, proxy);
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
				throw new CheckVkUserError(errors, new Error('errors with some checks'));
			}
		} catch (error) {
			let displayError = error;
			if (!(displayError instanceof BaseTaskError)) {
				displayError = TaskErrorFactory.createError(
					'default',
					new Error('errors with some checks'),
					usersCredentials,
				);
			}

			this.taskDocument._error = displayError.toObject();
			throw displayError;
		} finally {
			const Task = mongoose.model('Task');
			this.taskDocument.lastHandleAt = new Date();
			this.taskDocument.status = Task.status.finished;
			await this.taskDocument.save();
		}
	}
}

export default CheckAndAddUsersTask;
