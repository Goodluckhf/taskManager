import mongoose from 'mongoose';
import moment   from 'moment';

import BaseTask     from './BaseTask';
import CommentsTask from './CommentsTask';
import BaseApiError from '../api/errors/BaseApiError';

/**
 * @property {Number} serviceIndex
 */
class CommentsCommonTask extends BaseTask {
	constructor({ serviceIndex = 0, ...args }) {
		super(args);
		this.serviceIndex = serviceIndex;
	}
	
	async createTaskAndHandle(serviceIndex) {
		const CommentsTaskModel      = mongoose.model('CommentsTask');
		const CommentsCheckTaskModel = mongoose.model('CommentsCheckTask');
		const TaskModel              = mongoose.model('Task');
		
		const serviceOrder = this.config.get('commentsTask.serviceOrder');
		const service      = serviceOrder[serviceIndex];
		
		const commentsTaskDocument = CommentsTaskModel.createInstance({
			commentsCount: this.taskDocument.commentsCount,
			postLink     : this.taskDocument.postLink,
			parentTask   : this.taskDocument,
			status       : TaskModel.status.pending,
			service,
		});
		
		this.taskDocument.subTasks.push(commentsTaskDocument);
		await Promise.all([
			this.taskDocument.save(),
			commentsTaskDocument.save(),
		]);
		
		const commentsTask = new CommentsTask({
			rpcClient   : this.rpcClient,
			logger      : this.logger,
			config      : this.config,
			taskDocument: commentsTaskDocument,
		});
		
		await commentsTask.handle();
		
		// Если задача выполнилась без ошибки
		// То создаем задачу на проверку
		this.taskDocument.status = TaskModel.status.checking;
		const checkDelay = this.config.get('commentsTask.checkingDelay');
		const checkTaskDocument = CommentsCheckTaskModel.createInstance({
			serviceIndex,
			commentsCount: this.config.get('commentsTask.commentsToCheck'),
			postLink     : this.taskDocument.postLink,
			parentTask   : this.taskDocument,
			startAt      : moment().add(checkDelay, 'm'),
		});
		this.taskDocument.subTasks.push(checkTaskDocument);
		
		await Promise.all([
			this.taskDocument.save(),
			checkTaskDocument.save(),
		]);
	}
	
	async loopHandleTasks(_serviceIndex) {
		const TaskModel = mongoose.model('Task');
		const serviceOrder = this.config.get('commentsTask.serviceOrder');
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
			if (!(displayError instanceof BaseApiError)) {
				displayError = new BaseApiError(error.message, 500).combine(error);
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

export default CommentsCommonTask;
