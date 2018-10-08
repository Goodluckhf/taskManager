import mongoose from 'mongoose';
import moment   from 'moment';

import BaseTask         from './BaseTask';
import LikesTask        from './LikesTask';
import TaskErrorFactory from '../api/errors/tasks/TaskErrorFactory';
import BaseTaskError    from '../api/errors/tasks/BaseTaskError';

/**
 * @property {Number} serviceIndex
 */
class LikesCommonTask extends BaseTask {
	constructor({ serviceIndex = 0, ...args }) {
		super(args);
		this.serviceIndex = serviceIndex;
	}
	
	async createTaskAndHandle(serviceIndex) {
		const LikesTaskModel      = mongoose.model('LikesTask');
		const LikesCheckTaskModel = mongoose.model('LikesCheckTask');
		const TaskModel           = mongoose.model('Task');
		const serviceOrder = this.config.get('likesTask.serviceOrder');
		const service      = serviceOrder[serviceIndex];
		
		const likesTaskDocument = LikesTaskModel.createInstance({
			likesCount: this.taskDocument.likesCount,
			postLink  : this.taskDocument.postLink,
			parentTask: this.taskDocument,
			user      : this.taskDocument.user,
			status    : TaskModel.status.pending,
			service,
		});
		
		this.taskDocument.subTasks.push(likesTaskDocument);
		await Promise.all([
			this.taskDocument.save(),
			likesTaskDocument.save(),
		]);
		
		const likesTask = new LikesTask({
			rpcClient   : this.rpcClient,
			logger      : this.logger,
			config      : this.config,
			taskDocument: likesTaskDocument,
		});
		
		await likesTask.handle();
		
		// Если задача выполнилась без ошибки
		// То создаем задачу на проверку
		this.taskDocument.status = TaskModel.status.checking;
		const checkDelay   = this.config.get('likesTask.checkingDelay');
		const likesToCheck = this.taskDocument.likesCount * parseFloat(this.config.get('likesTask.likesToCheck'));
		
		const checkTaskDocument = LikesCheckTaskModel.createInstance({
			serviceIndex,
			likesCount: likesToCheck,
			postLink  : this.taskDocument.postLink,
			parentTask: this.taskDocument,
			user      : this.taskDocument.user,
			startAt   : moment().add(checkDelay, 'm'),
		});
		
		this.taskDocument.subTasks.push(checkTaskDocument);
		await Promise.all([
			this.taskDocument.save(),
			checkTaskDocument.save(),
		]);
	}
	
	async loopHandleTasks(_serviceIndex) {
		const TaskModel = mongoose.model('Task');
		const serviceOrder = this.config.get('likesTask.serviceOrder');
		const serviceIndex = _serviceIndex || this.serviceIndex;
		const service = serviceOrder[serviceIndex];
		
		try {
			return await this.createTaskAndHandle(serviceIndex);
		} catch (error) {
			this.logger.error({
				error,
				service,
			});
			
			if (serviceOrder.length !== serviceIndex + 1) {
				return this.loopHandleTasks(serviceIndex + 1);
			}
			
			// Это последний был, значит пора выкидывать ошибку
			let displayError = error;
			if (!(displayError instanceof BaseTaskError)) {
				displayError = TaskErrorFactory.createError(
					'likes',
					error,
					this.taskDocument.postLink,
					this.taskDocument.likesCount,
				);
			}
			
			this.taskDocument._error = displayError.toObject();
			this.taskDocument.status = TaskModel.status.finished;
			await this.taskDocument.save();
			throw displayError;
		}
	}
	
	async handle() {
		// В конфиге задается порядок сервисов
		// И мы при ошибке пытаемся поставить лайки через другой сервис
		// Пока сервисов 3 поэтому так оствалю
		// Если цепочка увеличится можно придумать абстракцию
		return this.loopHandleTasks();
	}
}

export default LikesCommonTask;
