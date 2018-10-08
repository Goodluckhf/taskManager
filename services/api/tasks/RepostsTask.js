import mongoose         from 'mongoose';
import BaseTask         from './BaseTask';
import RepostRequest    from '../api/amqpRequests/RepostRequest';
import TaskErrorFactory from '../api/errors/tasks/TaskErrorFactory';

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
			const wrappedError = TaskErrorFactory.createError(
				'reposts',
				error,
				this.taskDocument.postLink,
				this.taskDocument.repostsCount,
			);
			this.taskDocument._error  = wrappedError.toObject();
			throw wrappedError;
		} finally {
			this.taskDocument.status = Task.status.finished;
			await this.taskDocument.save();
		}
	}
}

export default RepostsTask;
