import mongoose         from '../../../lib/mongoose';
import BaseTask         from './BaseTask';
import RepostRequest    from '../api/amqpRequests/RepostRequest';
import TaskErrorFactory from '../api/errors/tasks/TaskErrorFactory';

class RepostsTask extends BaseTask {
	async handle() {
		const Task = mongoose.model('Task');
		try {
			const serviceCredentials = this.getCredentialsForService(this.taskDocument.service);
			
			const request = new RepostRequest(this.taskDocument.service, this.config, {
				postLink    : this.taskDocument.postLink,
				repostsCount: this.taskDocument.repostsCount,
				serviceCredentials,
			});
			
			this.logger.info({
				mark   : 'reposts',
				message: 'rpc request',
				taskId : this.taskDocument.parentTask.id,
				userId : this.taskDocument.user.id,
				request,
			});
			
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
			this.taskDocument.status       = Task.status.finished;
			this.taskDocument.lastHandleAt = new Date();
			await this.taskDocument.save();
		}
	}
}

export default RepostsTask;
