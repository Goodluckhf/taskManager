import mongoose from 'mongoose';
import moment   from 'moment';

import BaseTask     from './BaseTask';
import LikesTask    from './LikesTask';
import BaseApiError from '../api/errors/BaseApiError';

class LikesCommonTask extends BaseTask {
	async createTaskAndHandle(service) {
		const LikesTaskModel      = mongoose.model('LikesTask');
		const LikesCheckTaskModel = mongoose.model('LikesCheckTask');
		const TaskModel           = mongoose.model('Task');
		
		const likesTaskDocument = LikesTaskModel.createInstance({
			likesCount: this.taskDocument.likesCount,
			postLink  : this.taskDocument.postLink,
			parentTask: this.taskDocument,
			service,
		});
		likesTaskDocument.status = TaskModel.status.pending;
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
			service,
		});
		
		await likesTask.handle();
		this.taskDocument.status = TaskModel.status.checking;
		const checkDelay = this.config.get('likesTask.checkingDelay');
		const checkTaskDocument = LikesCheckTaskModel.createInstance({
			likesCount: this.taskDocument.likesCount,
			postLink  : this.taskDocument.postLink,
			parentTask: this.taskDocument,
			startAt   : moment().add(checkDelay, 'm'),
		});
		
		await Promise.all([
			this.taskDocument.save(),
			checkTaskDocument.save(),
		]);
	}
	
	async handle() {
		const TaskDocument = mongoose.model('Task');
		const serviceOrder = this.config.get('likesTask.serviceOrder');
		// В конфиге задается порядок сервисов
		// И мы при ошибке пытаемся поставить лайки через другой сервис
		// Пока сервисов 3 поэтому так оствалю
		// Если цепочка увеличится можно придумать абстракцию
		try {
			await this.createTaskAndHandle(serviceOrder[0]);
		} catch (error) {
			this.logger.error({
				error,
				service: serviceOrder[0],
			});
			try {
				await this.createTaskAndHandle(serviceOrder[1]);
			} catch (_error) {
				this.logger.error({
					error  : _error,
					service: serviceOrder[1],
				});
				try {
					await this.createTaskAndHandle(serviceOrder[2]);
				} catch (__error) {
					this.logger.error({
						error  : __error,
						service: serviceOrder[2],
					});
					let displayError = __error;
					if (!(displayError instanceof BaseApiError)) {
						displayError = new BaseApiError(__error.message, 500).combine(__error);
					}
					
					this.taskDocument._error = displayError.toObject();
				} finally {
					this.taskDocument.status = TaskDocument.status.finished;
					await this.taskDocument.save();
				}
			}
		}
	}
}

export default LikesCommonTask;
