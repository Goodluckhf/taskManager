import mongoose      from 'mongoose';
import BaseTask      from './BaseTask';
import RepostRequest from '../api/amqpRequests/RepostRequest';
import BaseApiError  from '../api/errors/BaseApiError';

class RepostsTask extends BaseTask {
	async handle() {
		const Task = mongoose.model('Task');
		try {
			const request = new RepostRequest(this.taskDocument.service, this.config, {
				postLink    : this.taskDocument.postLink,
				repostsCount: this.taskDocument.repostsCount,
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

export default RepostsTask;
