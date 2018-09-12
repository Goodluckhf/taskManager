import mongoose from 'mongoose';

import BaseTask     from './BaseTask';
import LikeRequest  from '../api/amqpRequests/LikeRequest';
import BaseApiError from '../api/errors/BaseApiError';
/**
 * @property {TaskDocument} parentTask
 * @property {VkApi} vkApi
 */
class LikesTask extends BaseTask {
	constructor({ parentTask, vkApi, ...args }) {
		super(args);
		this.parentTask = parentTask;
		this.vkApi      = vkApi;
	}
	
	async handle() {
		const Task = mongoose.model('Task');
		
		this.parentTask.subTasks.push(this.taskDocument);
		await this.taskDocument.save();
		
		const request = new LikeRequest(this.config, {
			postLink  : this.taskDocument.postLink,
			likesCount: this.taskDocument.likesCount,
		});
		this.logger.info({ request });
		
		(async () => {
			try {
				const result = await this.rpcClient.call(request);
				if (result.error) {
					throw result.error;
				}
			} catch (error) {
				const wrapedError = new BaseApiError(error.message, 500).combine(error);
				this.logger.error({ error });
				this.taskDocument._error  = wrapedError.toObject();
				// @TODO: Вынести в алерт в либы
				await this.vkApi.apiRequest('messages.send', {
					chat_id: this.config.get('vkAlert.chat_id'),
					message: JSON.stringify(wrapedError.toObject(), null, 2),
				});
			}
			
			this.taskDocument.status = Task.status.finished;
			await this.taskDocument.save();
			
			// Сохраняем родительскую задачу, что бы проставить статусы
			this.parentTask.lastLikedAt = new Date();
			this.parentTask.status      = Task.status.waiting;
			await this.parentTask.save();
		})();
	}
}

export default LikesTask;
