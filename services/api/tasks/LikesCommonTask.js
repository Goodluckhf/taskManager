import mongoose from 'mongoose';

import BaseTask  from './BaseTask';
import LikesTask from './LikesTask';

class LikesCommonTask extends BaseTask {
	async createTaskAndHandle(service) {
		const LikesTaskDocument = mongoose.model('LikesTask');
		
		const likesTaskDocument = LikesTaskDocument.createInstance({
			likesCount: this.taskDocument.likesCount,
			postLink  : this.taskDocument.postLink,
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
			taskDocument: likesTaskDocument,
			service,
		});
		
		await likesTask.handle();
		//@TODO: Создать задачу на проверку лайков
	}
	
	async handle() {
		const serviceOrder = this.config.get('likesTask.serviceOrder');
		
		// В конфиге задается порядок сервисов
		// И мы при ошибке пытаемся поставить лайки через другой сервис
		// Пока сервисов 3 поэтому так оствалю
		// Если цепочка увеличится можно придумать абстракцию
		try {
			await this.createTaskAndHandle(serviceOrder[0]);
		} catch (error) {
			try {
				await this.createTaskAndHandle(serviceOrder[1]);
			} catch (_error) {
				await this.createTaskAndHandle(serviceOrder[2]);
			}
		}
	}
}

export default LikesCommonTask;
