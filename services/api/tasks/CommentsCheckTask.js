import mongoose         from 'mongoose';
import BaseTask         from './BaseTask';

import CommentsCheckRequest from '../api/amqpRequests/CommentCheckRequest';
import CommentsCommonTask   from './CommentsCommonTask';
import BaseApiError         from '../api/errors/BaseApiError';

class CommentsCheckTask extends BaseTask {
	async handle() {
		const Task = mongoose.model('Task');
		
		const request = new CommentsCheckRequest(this.config, {
			postLink     : this.taskDocument.postLink,
			commentsCount: this.config.get('commentsTask.commentsToCheck'),
		});
		
		try {
			await this.rpcClient.call(request);
			this.taskDocument.parentTask.status = Task.status.finished;
		} catch (error) {
			this.logger.warn({ error });
			const serviceOrder = this.config.get('commentsTask.serviceOrder');
			if (serviceOrder.length === this.taskDocument.serviceIndex + 1) {
				error.postLink      = this.taskDocument.postLink;
				error.commentsCount = this.taskDocument.commentsCount;
				throw new BaseApiError(error.message, 500).combine(error);
			}
			
			this.taskDocument.parentTask.status = Task.status.pending;
			await this.taskDocument.parentTask.save();
			
			const commentsTask = new CommentsCommonTask({
				serviceIndex: this.taskDocument.serviceIndex + 1,
				logger      : this.logger,
				taskDocument: this.taskDocument.parentTask,
				rpcClient   : this.rpcClient,
				config      : this.config,
			});
			
			await commentsTask.handle();
		} finally {
			this.taskDocument.status = Task.status.finished;
			await Promise.all([
				this.taskDocument.save(),
				this.taskDocument.parentTask.save(),
			]);
		}
	}
}

export default CommentsCheckTask;
