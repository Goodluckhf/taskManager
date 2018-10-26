import moment from 'moment';

import mongoose         from '../../../lib/mongoose';
import BaseTask         from './BaseTask';
import RepostsTask      from './RepostsTask';
import TaskErrorFactory from '../api/errors/tasks/TaskErrorFactory';
import BaseTaskError    from '../api/errors/tasks/BaseTaskError';
import BillingAccount   from '../billing/BillingAccount';

/**
 * @property {Number} serviceIndex
 * @property {RepostsCommonTaskDocument} taskDocument
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
			user        : this.taskDocument.user,
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
			account     : this.account,
			uMetrics    : this.uMetrics,
		});
		
		this.logger.info({
			service,
			mark        : 'reposts',
			status      : 'pending',
			try         : serviceIndex,
			message     : 'Запускаем задачу накрутки репостов',
			repostsCount: this.taskDocument.repostsCount,
			postLink    : this.taskDocument.postLink,
			userId      : this.taskDocument.user.id,
			taskId      : this.taskDocument.id,
		});
		
		await repostsTask.handle();
		
		// Если задача выполнилась без ошибки
		// То создаем задачу на проверку
		this.taskDocument.status = TaskModel.status.checking;
		const checkDelay     = this.config.get('repostsTask.checkingDelay');
		const repostsToCheck = this.taskDocument.repostsCount * parseFloat(this.config.get('repostsTask.repostsToCheck'));
		
		this.logger.info({
			service,
			repostsToCheck,
			mark        : 'reposts',
			status      : 'success',
			try         : serviceIndex,
			message     : 'Выполнилась без ошибки. Создаем задачу на проверку',
			repostsCount: this.taskDocument.repostsCount,
			postLink    : this.taskDocument.postLink,
			userId      : this.taskDocument.user.id,
			taskId      : this.taskDocument.id,
		});
		
		const checkTaskDocument = RepostsCheckTaskModel.createInstance({
			serviceIndex,
			repostsCount: repostsToCheck,
			postLink    : this.taskDocument.postLink,
			parentTask  : this.taskDocument,
			user        : this.taskDocument.user,
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
				try         : serviceIndex,
				mark        : 'reposts',
				status      : 'fail',
				repostsCount: this.taskDocument.repostsCount,
				postLink    : this.taskDocument.postLink,
				userId      : this.taskDocument.user.id,
				taskId      : this.taskDocument.id,
			});
			
			if (serviceOrder.length !== serviceIndex + 1) {
				return this.loopHandleTasks(serviceIndex + 1);
			}
			
			if (this.account instanceof BillingAccount) {
				await this.account.rollBack(this.taskDocument);
			}
			
			// Это последний был, значит пора выкидывать ошибку
			let displayError = error;
			if (!(displayError instanceof BaseTaskError)) {
				displayError = TaskErrorFactory.createError(
					'reposts',
					error,
					this.taskDocument.postLink,
					this.taskDocument.repostsCount,
				);
			}
			
			this.taskDocument.lastHandleAt = new Date();
			this.taskDocument._error       = displayError.toObject();
			this.taskDocument.status       = TaskModel.status.finished;
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
