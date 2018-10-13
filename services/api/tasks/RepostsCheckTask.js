import mongoose           from '../../../lib/mongoose';
import BaseTask           from './BaseTask';
import RepostCheckRequest from '../api/amqpRequests/RepostCheckRequest';
import RepostsCommonTask  from './RepostsCommonTask';
import TaskErrorFactory   from '../api/errors/tasks/TaskErrorFactory';

class RepostsCheckTask extends BaseTask {
	async handle() {
		const Task = mongoose.model('Task');
		
		const request = new RepostCheckRequest(this.config, {
			postLink    : this.taskDocument.postLink,
			repostsCount: this.taskDocument.repostsCount,
		});
		
		try {
			await this.rpcClient.call(request);
			this.logger.info({
				mark        : 'reposts',
				message     : 'Успешно накрутились',
				postLink    : this.taskDocument.parentTask.postLink,
				repostsCount: this.taskDocument.parentTask.repostsCount,
				userId      : this.taskDocument.user.id,
				taskId      : this.taskDocument.id,
			});
			this.taskDocument.parentTask.status       = Task.status.finished;
			this.taskDocument.parentTask.lastHandleAt = new Date();
		} catch (error) {
			this.logger.error({
				mark        : 'reposts',
				postLink    : this.taskDocument.postLink,
				repostsCount: this.taskDocument.repostsCount,
				userId      : this.taskDocument.user.id,
				taskId      : this.taskDocument.id,
				error,
			});
			
			const serviceOrder = this.config.get('repostsTask.serviceOrder');
			if (serviceOrder.length === this.taskDocument.serviceIndex + 1) {
				const wrappedError = TaskErrorFactory.createError(
					'reposts',
					error,
					this.taskDocument.postLink,
					this.taskDocument.parentTask.repostsCount,
				);
				
				this.taskDocument.parentTask.lastHandleAt = new Date();
				this.taskDocument.parentTask.status       = Task.status.finished;
				this.taskDocument.parentTask._error       = wrappedError.toObject();
				throw wrappedError;
			}
			
			this.taskDocument.parentTask.status = Task.status.pending;
			await this.taskDocument.parentTask.save();
			await this.taskDocument.parentTask.populate('user').execPopulate();
			
			const repostsTask = new RepostsCommonTask({
				serviceIndex: this.taskDocument.serviceIndex + 1,
				logger      : this.logger,
				taskDocument: this.taskDocument.parentTask,
				rpcClient   : this.rpcClient,
				config      : this.config,
			});
			
			this.logger.info({
				mark        : 'reposts',
				message     : 'Запускаем задачу на следущий сервис',
				repostsCount: this.taskDocument.repostsCount,
				service     : serviceOrder[this.taskDocument.serviceIndex + 1],
				userId      : this.taskDocument.user.id,
				taskId      : this.taskDocument.parentTask.id,
				error,
			});
			
			await repostsTask.handle();
		} finally {
			this.taskDocument.lastHandleAt = new Date();
			this.taskDocument.status       = Task.status.finished;
			await Promise.all([
				this.taskDocument.save(),
				this.taskDocument.parentTask.save(),
			]);
		}
	}
}

export default RepostsCheckTask;
