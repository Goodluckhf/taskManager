import mongoose         from 'mongoose';
import BaseTask         from './BaseTask';
import CommentRequest   from '../api/amqpRequests/CommentRequest';
import TaskErrorFactory from '../api/errors/tasks/TaskErrorFactory';

class CommentsTask extends BaseTask {
	async handle() {
		const Task = mongoose.model('Task');
		try {
			const serviceCredentials = this.getCredentialsForService(this.taskDocument.service);
			
			const request = new CommentRequest(this.taskDocument.service, this.config, {
				postLink     : this.taskDocument.postLink,
				commentsCount: this.taskDocument.commentsCount,
				serviceCredentials,
			});
			
			this.logger.info({
				mark   : 'comments',
				message: 'rpc request',
				taskId : this.taskDocument.parentTask.id,
				userId : this.taskDocument.user.id,
				request,
			});
			
			await this.rpcClient.call(request);
		} catch (error) {
			const wrappedError = TaskErrorFactory.createError(
				'comments',
				error,
				this.taskDocument.postLink,
				this.taskDocument.commentsCount,
			);
			
			this.taskDocument._error  = wrappedError.toObject();
			throw wrappedError;
		} finally {
			this.taskDocument.lastHandleAt = new Date();
			this.taskDocument.status       = Task.status.finished;
			await this.taskDocument.save();
		}
	}
}

export default CommentsTask;
