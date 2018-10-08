import mongoose         from 'mongoose';
import BaseTask         from './BaseTask';

import RepostCheckRequest from '../api/amqpRequests/RepostCheckRequest';
import RepostsCommonTask  from './RepostsCommonTask';
import TaskErrorFactory   from '../api/errors/tasks/TaskErrorFactory';

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
				const wrappedError = TaskErrorFactory.createError(
					'reposts',
					error,
					this.taskDocument.postLink,
					this.taskDocument.parentTask.repostsCount,
				);
				
				this.taskDocument.parentTask.status = Task.status.finished;
				this.taskDocument.parentTask._error = wrappedError.toObject();
				throw wrappedError;
			}
			
			this.taskDocument.parentTask.status = Task.status.pending;
			await this.taskDocument.parentTask.save();
			
			const repostsTask = new RepostsCommonTask({
				serviceIndex: this.taskDocument.serviceIndex + 1,
				user        : this.taskDocument.user,
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
