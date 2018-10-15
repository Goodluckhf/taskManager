import mongoose         from 'mongoose';
import BaseTask         from './BaseTask';
import LikeCheckRequest from '../api/amqpRequests/LikeCheckRequest';
import LikesCommonTask  from './LikesCommonTask';
import TaskErrorFactory from '../api/errors/tasks/TaskErrorFactory';

class LikesCheckTask extends BaseTask {
	async handle() {
		const Task = mongoose.model('Task');
		
		const request = new LikeCheckRequest(this.config, {
			postLink  : this.taskDocument.postLink,
			likesCount: this.taskDocument.likesCount,
		});
		
		try {
			await this.rpcClient.call(request);
			this.logger.info({
				mark      : 'likes',
				message   : 'Успешно накрутились',
				userId    : this.taskDocument.user.id,
				taskId    : this.taskDocument.id,
				postLink  : this.taskDocument.parentTask.postLink,
				likesCount: this.taskDocument.parentTask.likesCount,
			});
			this.taskDocument.parentTask.status       = Task.status.finished;
			this.taskDocument.parentTask.lastHandleAt = new Date();
		} catch (error) {
			this.logger.error({
				postLink  : this.taskDocument.postLink,
				likesCount: this.taskDocument.likesCount,
				userId    : this.taskDocument.user.id,
				taskId    : this.taskDocument.id,
				error,
			});
			const serviceOrder = this.config.get('likesTask.serviceOrder');
			if (serviceOrder.length === this.taskDocument.serviceIndex + 1) {
				const wrappedError = TaskErrorFactory.createError(
					'likes',
					error,
					this.taskDocument.postLink,
					this.taskDocument.parentTask.likesCount,
				);
				
				this.taskDocument.parentTask.lastHandleAt = new Date();
				this.taskDocument.parentTask.status       = Task.status.finished;
				this.taskDocument.parentTask._error       = wrappedError.toObject();
				throw wrappedError;
			}
			
			this.taskDocument.parentTask.status = Task.status.pending;
			await this.taskDocument.parentTask.save();
			await this.taskDocument.parentTask.populate('user').execPopulate();
			
			this.logger.info({
				mark      : 'likes',
				message   : 'Запускаем задачу на следущий сервис',
				likesCount: this.taskDocument.likesCount,
				service   : serviceOrder[this.taskDocument.serviceIndex + 1],
				userId    : this.taskDocument.user.id,
				taskId    : this.taskDocument.parentTask.id,
			});
			
			const likesTask = new LikesCommonTask({
				serviceIndex: this.taskDocument.serviceIndex + 1,
				logger      : this.logger,
				taskDocument: this.taskDocument.parentTask,
				rpcClient   : this.rpcClient,
				config      : this.config,
			});
			
			await likesTask.handle();
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

export default LikesCheckTask;
