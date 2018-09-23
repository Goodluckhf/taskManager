import mongoose from 'mongoose';

import BaseTask     from './BaseTask';
import BaseApiError from '../api/errors/BaseApiError';
import CommentsTask from './CommentsTask';

class CommentsCommonTask extends BaseTask {
	async createTaskAndHandle(service) {
		const CommentsTaskModel = mongoose.model('CommentsTask');
		const TaskDocument      = mongoose.model('Task');
		
		const commentsTaskDocument = CommentsTaskModel.createInstance({
			commentsCount: this.taskDocument.commentsCount,
			postLink     : this.taskDocument.postLink,
			parentTask   : this.taskDocument,
			service,
		});
		commentsTaskDocument.status = TaskDocument.status.pending;
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
		//@TODO: Создать задачу на проверку комментов
	}
	
	async handle() {
		const TaskDocument = mongoose.model('Task');
		const serviceOrder = this.config.get('commentsTask.serviceOrder');
		// В конфиге задается порядок сервисов
		// И мы при ошибке пытаемся поставить лайки через другой сервис
		// Пока сервиса 2 поэтому так оствалю
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
				
				let displayError = _error;
				if (!(displayError instanceof BaseApiError)) {
					displayError = new BaseApiError(_error.message, 500).combine(_error);
				}
				
				this.taskDocument._error = displayError.toObject();
			}
		} finally {
			this.taskDocument.status = TaskDocument.status.finished;
			await this.taskDocument.save();
		}
	}
}

export default CommentsCommonTask;
