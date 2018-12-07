import mongoose from '../../../lib/mongoose';
import BaseTask from './BaseTask';
import BaseApiError from '../api/errors/BaseApiError';
import CheckWallBanRequest from '../api/amqpRequests/CheckWallBanRequest';

class CheckWallBanTask extends BaseTask {
	async handle() {
		const Task = mongoose.model('Task');
		try {
			await this.taskDocument.populate('group').execPopulate();

			const request = new CheckWallBanRequest(this.config, {
				postCount: this.taskDocument.postCount,
				link: this.taskDocument.group.link,
			});
			this.logger.info({ request });

			await this.rpcClient.call(request);
			this.taskDocument.status = Task.status.waiting;
		} catch (error) {
			const wrapedError = new BaseApiError(error.message, 500).combine(error);
			this.taskDocument._error = wrapedError.toObject();
			this.taskDocument.status = Task.status.skipped;
			throw wrapedError;
		} finally {
			await this.taskDocument.save();
		}
	}
}

export default CheckWallBanTask;
