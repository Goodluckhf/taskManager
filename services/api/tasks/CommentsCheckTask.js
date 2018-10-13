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
				message      : 'Успешно накрутились',
				postLink     : this.taskDocument.parentTask.postLink,
				commentsCount: this.taskDocument.parentTask.commentsCount,
			});
			
			this.taskDocument.parentTask.status       = Task.status.finished;
			this.taskDocument.parentTask.lastHandleAt = new Date();
		} catch (error) {
			this.logger.warn({
				postLink     : this.taskDocument.postLink,
				commentsCount: this.taskDocument.commentsCount,
				error,
			});
			const serviceOrder = this.config.get('commentsTask.serviceOrder');
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
