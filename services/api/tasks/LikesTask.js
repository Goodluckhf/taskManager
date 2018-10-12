import mongoose         from 'mongoose';
import BaseTask         from './BaseTask';
import LikeRequest      from '../api/amqpRequests/LikeRequest';
import TaskErrorFactory from '../api/errors/tasks/TaskErrorFactory';

/**
 * @property {String} service
 */
class LikesTask extends BaseTask {
	async handle() {
		const Task = mongoose.model('Task');
		try {
			const serviceCredentials = this.getCredentialsForService(this.taskDocument.service);
			
			const request = new LikeRequest(this.taskDocument.service, this.config, {
				postLink  : this.taskDocument.postLink,
				likesCount: this.taskDocument.likesCount,
				serviceCredentials,
			});
			this.logger.info({ request });
			
			await this.rpcClient.call(request);
		} catch (error) {
			const wrappedError = TaskErrorFactory.createError(
				'likes',
				error,
				this.taskDocument.postLink,
				this.taskDocument.likesCount,
			);
			
			this.taskDocument._error = wrappedError.toObject();
			throw wrappedError;
		} finally {
			this.taskDocument.lastHandleAt = new Date();
			this.taskDocument.status       = Task.status.finished;
			await this.taskDocument.save();
		}
	}
}

export default LikesTask;
