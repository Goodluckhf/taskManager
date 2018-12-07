import mongoose from '../../../lib/mongoose';
import BaseTask from './BaseTask';
import PostByLinkRequest from '../api/amqpRequests/PostByLinkRequest';
import LikesCommonTask from './LikesCommonTask';
import TaskErrorFactory from '../api/errors/tasks/TaskErrorFactory';
import BillingAccount from '../billing/BillingAccount';

/**
 * @property {LikesCheckTaskDocument} taskDocument
 */
class LikesCheckTask extends BaseTask {
	async handle() {
		const Task = mongoose.model('Task');
		const serviceOrder = this.config.get('likesTask.serviceOrder');

		const request = new PostByLinkRequest(this.config, {
			postLink: this.taskDocument.postLink,
			likesCount: this.taskDocument.likesCount,
		});

		let response = null;
		try {
			response = await this.rpcClient.call(request);
		} catch (error) {
			this.logger.error({
				mark: 'likes',
				postLink: this.taskDocument.postLink,
				likesCount: this.taskDocument.likesCount,
				service: serviceOrder[this.taskDocument.serviceIndex],
				userId: this.taskDocument.user.id,
				taskId: this.taskDocument.id,
				error,
			});
			this.taskDocument.parentTask.status = Task.status.waiting;
			await this.taskDocument.parentTask.save();
			return;
		}

		if (response.likes >= this.taskDocument.likesCount) {
			this.logger.info({
				mark: 'likes',
				message: 'Успешно накрутились',
				postLink: this.taskDocument.parentTask.postLink,
				likesCount: this.taskDocument.parentTask.likesCount,
				userId: this.taskDocument.user.id,
				taskId: this.taskDocument.parentTask.id,
			});

			// Успешное выполнение
			// Снимаем баллы с баланса
			if (this.account instanceof BillingAccount) {
				await this.account.commit(this.taskDocument.parentTask);
			}

			this.taskDocument.parentTask.status = Task.status.finished;
			this.taskDocument.parentTask.lastHandleAt = new Date();
			this.taskDocument.lastHandleAt = new Date();
			this.taskDocument.status = Task.status.finished;
			await Promise.all([this.taskDocument.save(), this.taskDocument.parentTask.save()]);
			return;
		}

		this.logger.warn({
			mark: 'likes',
			postLink: this.taskDocument.postLink,
			likesCount: this.taskDocument.likesCount,
			userId: this.taskDocument.user.id,
			taskId: this.taskDocument.id,
			message: 'лайки не накрутились',
		});

		if (serviceOrder.length === this.taskDocument.serviceIndex + 1) {
			if (this.account instanceof BillingAccount) {
				await this.account.rollBack(this.taskDocument.parentTask);
			}

			const wrappedError = TaskErrorFactory.createError(
				'likes',
				new Error('лайки не накрутились'),
				this.taskDocument.postLink,
				this.taskDocument.parentTask.likesCount,
			);

			this.taskDocument.parentTask.lastHandleAt = new Date();
			this.taskDocument.parentTask.status = Task.status.finished;
			this.taskDocument.parentTask._error = wrappedError.toObject();
			this.taskDocument.lastHandleAt = new Date();
			this.taskDocument.status = Task.status.finished;
			await Promise.all([this.taskDocument.save(), this.taskDocument.parentTask.save()]);
			throw wrappedError;
		}

		this.taskDocument.parentTask.status = Task.status.pending;
		await this.taskDocument.parentTask.save();
		await this.taskDocument.parentTask.populate('user').execPopulate();

		this.logger.info({
			mark: 'likes',
			message: 'Запускаем задачу на следущий сервис',
			likesCount: this.taskDocument.likesCount,
			service: serviceOrder[this.taskDocument.serviceIndex + 1],
			userId: this.taskDocument.user.id,
			taskId: this.taskDocument.id,
		});

		const likesTask = new LikesCommonTask({
			billing: this.billing,
			account: this.account,
			serviceIndex: this.taskDocument.serviceIndex + 1,
			logger: this.logger,
			taskDocument: this.taskDocument.parentTask,
			rpcClient: this.rpcClient,
			config: this.config,
			uMetrics: this.uMetrics,
		});

		await likesTask.handle();
		this.taskDocument.lastHandleAt = new Date();
		this.taskDocument.status = Task.status.finished;
		await Promise.all([this.taskDocument.save(), this.taskDocument.parentTask.save()]);
	}
}

export default LikesCheckTask;
