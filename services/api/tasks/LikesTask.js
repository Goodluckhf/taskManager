import mongoose from 'mongoose';

import BaseTask     from './BaseTask';
import LikeRequest  from '../api/amqpRequests/LikeRequest';
import BaseApiError from '../api/errors/BaseApiError';

class LikesTask extends BaseTask {
	async handle() {
		const Task = mongoose.model('Task');
		
		try {
			const request = new LikeRequest(this.config, {
				postLink  : this.taskDocument.postLink,
				likesCount: this.taskDocument.likesCount,
			});
			this.logger.info({ request });
			
			const result = await this.rpcClient.call(request);
			if (result.error) {
				throw result.error;
			}
		} catch (error) {
			const wrapedError = new BaseApiError(error.message, 500).combine(error);
			this.logger.error({ error });
			this.taskDocument._error = wrapedError.toObject();
			throw wrapedError;
		} finally {
			this.taskDocument.status = Task.status.finished;
			await this.taskDocument.save();
		}
	}
}

export default LikesTask;