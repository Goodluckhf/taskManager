import mongoose         from 'mongoose';
import BaseTask         from './BaseTask';

import RepostCheckRequest from '../api/amqpRequests/RepostCheckRequest';
import RepostsCommonTask  from './RepostsCommonTask';
import BaseApiError       from '../api/errors/BaseApiError';

class RepostsCheckTask extends BaseTask {
	async handle() {
		const Task = mongoose.model('Task');
		
		const request = new RepostCheckRequest(this.config, {
			postLink    : this.taskDocument.postLink,
			repostsCount: this.config.get('repostsTask.repostsToCheck'),
		});
		
		try {
			await this.rpcClient.call(request);
			this.taskDocument.parentTask.status = Task.status.finished;
		} catch (error) {
			this.logger.warn({ error });
			const serviceOrder = this.config.get('repostsTask.serviceOrder');
			if (serviceOrder.length === this.taskDocument.serviceIndex + 1) {
				error.postLink      = this.taskDocument.postLink;
				error.repostsCount  = this.taskDocument.parentTask.repostsCount;
				const wrappedError  = new BaseApiError(error.message, 500).combine(error);
				
				this.taskDocument.parentTask.status = Task.status.finished;
				this.taskDocument.parentTask._error = wrappedError;
				throw wrappedError;
			}
			
			this.taskDocument.parentTask.status = Task.status.pending;
			await this.taskDocument.parentTask.save();
			
			const repostsTask = new RepostsCommonTask({
				serviceIndex: this.taskDocument.serviceIndex + 1,
				logger      : this.logger,
				taskDocument: this.taskDocument.parentTask,
				rpcClient   : this.rpcClient,
				config      : this.config,
			});
			
			await repostsTask.handle();
		} finally {
			this.taskDocument.status = Task.status.finished;
			await Promise.all([
				this.taskDocument.save(),
				this.taskDocument.parentTask.save(),
			]);
		}
	}
}

export default RepostsCheckTask;
