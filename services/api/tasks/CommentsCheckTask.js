import mongoose         from 'mongoose';
import BaseTask         from './BaseTask';

import CommentsCheckRequest from '../api/amqpRequests/CommentCheckRequest';
import CommentsCommonTask   from './CommentsCommonTask';
import TaskErrorFactory     from '../api/errors/tasks/TaskErrorFactory';

class CommentsCheckTask extends BaseTask {
	async handle() {
		const Task = mongoose.model('Task');
		
		const request = new CommentsCheckRequest(this.config, {
			postLink     : this.taskDocument.postLink,
			commentsCount: this.taskDocument.commentsCount,
		});
		
		try {
			await this.rpcClient.call(request);
			this.logger.info({
				mark         : 'comments',
				message      : 'Успешно накрутились',
				postLink     : this.taskDocument.parentTask.postLink,
				commentsCount: this.taskDocument.parentTask.commentsCount,
				userId       : this.taskDocument.user.id,
				taskId       : this.taskDocument.parentTask.id,
			});
			
			this.taskDocument.parentTask.status       = Task.status.finished;
			this.taskDocument.parentTask.lastHandleAt = new Date();
		} catch (error) {
			const serviceOrder = this.config.get('commentsTask.serviceOrder');
			this.logger.error({
				mark         : 'comments',
				postLink     : this.taskDocument.postLink,
				commentsCount: this.taskDocument.commentsCount,
				service      : serviceOrder[this.taskDocument.serviceIndex],
				userId       : this.taskDocument.user.id,
				taskId       : this.taskDocument.parentTask.id,
				error,
			});
			if (serviceOrder.length === this.taskDocument.serviceIndex + 1) {
				const wrappedError = TaskErrorFactory.createError(
					'comments',
					error,
					this.taskDocument.postLink,
					this.taskDocument.parentTask.commentsCount,
				);
				
				this.taskDocument.parentTask.status       = Task.status.finished;
				this.taskDocument.parentTask.lastHandleAt = new Date();
				this.taskDocument.parentTask._error       = wrappedError.toObject();
				throw wrappedError;
			}
			
			this.taskDocument.parentTask.status = Task.status.pending;
			await this.taskDocument.parentTask.save();
			await this.taskDocument.parentTask.populate('user').execPopulate();
			
			const commentsTask = new CommentsCommonTask({
				serviceIndex: this.taskDocument.serviceIndex + 1,
				logger      : this.logger,
				taskDocument: this.taskDocument.parentTask,
				rpcClient   : this.rpcClient,
				config      : this.config,
			});
			
			this.logger.info({
				mark         : 'comments',
				message      : 'Запускаем задачу на следущий сервис',
				commentsCount: this.taskDocument.commentsCount,
				service      : serviceOrder[this.taskDocument.serviceIndex + 1],
				userId       : this.taskDocument.user.id,
				taskId       : this.taskDocument.parentTask.id,
			});
			
			await commentsTask.handle();
		} finally {
			this.taskDocument.lastHandleAt = new Date();
			this.taskDocument.status       = Task.status.finished;
			await Promise.all([
				this.taskDocument.save(),
				this.taskDocument.parentTask.save(),
			]);
		}
	}
}

export default CommentsCheckTask;
