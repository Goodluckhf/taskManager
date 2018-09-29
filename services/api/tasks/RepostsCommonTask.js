import mongoose from 'mongoose';
import moment   from 'moment';

import BaseTask     from './BaseTask';
import RepostsTask  from './RepostsTask';
import BaseApiError from '../api/errors/BaseApiError';

/**
 * @property {Number} serviceIndex
 */
class RepostsCommonTask extends BaseTask {
	constructor({ serviceIndex = 0, ...args }) {
		super(args);
		this.serviceIndex = serviceIndex;
	}
	
	async createTaskAndHandle(serviceIndex) {
		const RepostsTaskModel      = mongoose.model('RepostsTask');
		const RepostsCheckTaskModel = mongoose.model('RepostsCheckTask');
		const TaskModel             = mongoose.model('Task');
		
		const serviceOrder = this.config.get('repostsTask.serviceOrder');
		const service      = serviceOrder[serviceIndex];
		
		const repostsTaskDocument = RepostsTaskModel.createInstance({
			repostsCount: this.taskDocument.repostsCount,
			postLink    : this.taskDocument.postLink,
			parentTask  : this.taskDocument,
			status      : TaskModel.status.pending,
			service,
		});
		
		this.taskDocument.subTasks.push(repostsTaskDocument);
		await Promise.all([
			this.taskDocument.save(),
			repostsTaskDocument.save(),
		]);
		
		const repostsTask = new RepostsTask({
			rpcClient   : this.rpcClient,
			logger      : this.logger,
			config      : this.config,
			taskDocument: repostsTaskDocument,
		});
		
		await repostsTask.handle();
		
		// Если задача выполнилась без ошибки
		// То создаем задачу на проверку
		this.taskDocument.status = TaskModel.status.checking;
		const checkDelay = this.config.get('repostsTask.checkingDelay');
		const checkTaskDocument = RepostsCheckTaskModel.createInstance({
			serviceIndex,
			repostsCount: this.config.get('repostsTask.repostsToCheck'),
			postLink    : this.taskDocument.postLink,
			parentTask  : this.taskDocument,
			startAt     : moment().add(checkDelay, 'm'),
		});
		this.taskDocument.subTasks.push(checkTaskDocument);
		
		await Promise.all([
			this.taskDocument.save(),
			checkTaskDocument.save(),
		]);
	}
	
	async loopHandleTasks(_serviceIndex) {
		const TaskModel    = mongoose.model('Task');
		const serviceOrder = this.config.get('repostsTask.serviceOrder');
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

export default RepostsCommonTask;
