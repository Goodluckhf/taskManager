import mongoose from 'mongoose';

import BaseTask     from './BaseTask';
import LikesTask    from './LikesTask';
import BaseApiError from '../api/errors/BaseApiError';

class LikesCommonTask extends BaseTask {
	async createTaskAndHandle(service) {
		const LikesTaskDocument = mongoose.model('LikesTask');
		const TaskDocument      = mongoose.model('Task');
		
		const likesTaskDocument = LikesTaskDocument.createInstance({
			likesCount: this.taskDocument.likesCount,
			postLink  : this.taskDocument.postLink,
			service,
		});
		likesTaskDocument.status = TaskDocument.status.pending;
		this.taskDocument.subTasks.push(likesTaskDocument);
		await Promise.all([
			this.taskDocument.save(),
			likesTaskDocument.save(),
		]);
		
		const likesTask = new LikesTask({
			rpcClient   : this.rpcClient,
			logger      : this.logger,
			taskDocument: likesTaskDocument,
			service,
		});
		
		await likesTask.handle();
		//@TODO: Создать задачу на проверку лайков
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
