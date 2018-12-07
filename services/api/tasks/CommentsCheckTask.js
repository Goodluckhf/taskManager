import mongoose from '../../../lib/mongoose';
import BaseTask from './BaseTask';
import PostByLinkRequest from '../api/amqpRequests/PostByLinkRequest';
import CommentsCommonTask from './CommentsCommonTask';
import TaskErrorFactory from '../api/errors/tasks/TaskErrorFactory';
import BillingAccount from '../billing/BillingAccount';

/**
 * @property {CommentsCheckTaskDocument} taskDocument
 */
class CommentsCheckTask extends BaseTask {
	async handle() {
		const Task = mongoose.model('Task');
		const serviceOrder = this.config.get('commentsTask.serviceOrder');

		const request = new PostByLinkRequest(this.config, {
			postLink: this.taskDocument.postLink,
			commentsCount: this.taskDocument.commentsCount,
		});

		let response = null;
		try {
			response = await this.rpcClient.call(request);
		} catch (error) {
			this.logger.error({
				mark: 'comments',
				postLink: this.taskDocument.postLink,
				commentsCount: this.taskDocument.commentsCount,
				service: serviceOrder[this.taskDocument.serviceIndex],
				userId: this.taskDocument.user.id,
				taskId: this.taskDocument.id,
				error,
			});
			this.taskDocument.parentTask.status = Task.status.waiting;
			await this.taskDocument.parentTask.save();
			return;
		}

		if (response.comments >= this.taskDocument.commentsCount) {
			this.logger.info({
				mark: 'comments',
				message: 'Успешно накрутились',
				postLink: this.taskDocument.parentTask.postLink,
				commentsCount: this.taskDocument.parentTask.commentsCount,
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
			mark: 'comments',
			postLink: this.taskDocument.postLink,
			commentsCount: this.taskDocument.commentsCount,
			service: serviceOrder[this.taskDocument.serviceIndex],
			userId: this.taskDocument.user.id,
			taskId: this.taskDocument.id,
			message: 'комменты не накрутились',
		});

		if (serviceOrder.length === this.taskDocument.serviceIndex + 1) {
			if (this.account instanceof BillingAccount) {
				await this.account.rollBack(this.taskDocument.parentTask);
			}

			const wrappedError = TaskErrorFactory.createError(
				'comments',
				new Error('Комменты не накрутились'),
				this.taskDocument.postLink,
				this.taskDocument.parentTask.commentsCount,
			);

			this.taskDocument.parentTask.status = Task.status.finished;
			this.taskDocument.parentTask.lastHandleAt = new Date();
			this.taskDocument.parentTask._error = wrappedError.toObject();
			this.taskDocument.lastHandleAt = new Date();
			this.taskDocument.status = Task.status.finished;
			await Promise.all([this.taskDocument.save(), this.taskDocument.parentTask.save()]);
			throw wrappedError;
		}

		this.taskDocument.parentTask.status = Task.status.pending;
		await this.taskDocument.parentTask.save();
		await this.taskDocument.parentTask.populate('user').execPopulate();

		const commentsTask = new CommentsCommonTask({
			serviceIndex: this.taskDocument.serviceIndex + 1,
			logger: this.logger,
			taskDocument: this.taskDocument.parentTask,
			rpcClient: this.rpcClient,
			config: this.config,
			uMetrics: this.uMetrics,
		});

		this.logger.info({
			mark: 'comments',
			message: 'Запускаем задачу на следущий сервис',
			commentsCount: this.taskDocument.commentsCount,
			service: serviceOrder[this.taskDocument.serviceIndex + 1],
			userId: this.taskDocument.user.id,
			taskId: this.taskDocument.id,
		});

		await commentsTask.handle();
		this.taskDocument.lastHandleAt = new Date();
		this.taskDocument.status = Task.status.finished;
		await Promise.all([this.taskDocument.save(), this.taskDocument.parentTask.save()]);
	}
}

export default CommentsCheckTask;
