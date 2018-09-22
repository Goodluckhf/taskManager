import mongoose       from 'mongoose';
import BaseTask       from './BaseTask';
import CommentRequest from '../api/amqpRequests/CommentRequest';
import BaseApiError   from '../api/errors/BaseApiError';

class CommentsTask extends BaseTask {
	constructor({ service, ...args }) {
		super(args);
		this.service = service;
	}
	
	async handle() {
		const Task = mongoose.model('Task');
		try {
			const request = new CommentRequest(this.service, this.config, {
				postLink     : this.taskDocument.postLink,
				commentsCount: this.taskDocument.commentsCount,
			});
			this.logger.info({ request });
			
			await this.rpcClient.call(request);
		} catch (error) {
			const wrapedError = new BaseApiError(error.message, 500).combine(error);
			this.taskDocument._error  = wrapedError.toObject();
			throw wrapedError;
		} finally {
			this.taskDocument.status = Task.status.finished;
			await this.taskDocument.save();
		}
	}
}

export default CommentsTask;
