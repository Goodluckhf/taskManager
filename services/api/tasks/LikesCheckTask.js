import mongoose         from 'mongoose';
import BaseTask         from './BaseTask';
import LikeCheckRequest from '../api/amqpRequests/LikeCheckRequest';
import LikesCommonTask  from './LikesCommonTask';
import TaskErrorFactory from '../api/errors/tasks/TaskErrorFactory';
import BillingAccount   from '../billing/BillingAccount';
import Billing          from '../billing/Billing';

/**
 * @property {LikesCheckTaskDocument} taskDocument
 */
class LikesCheckTask extends BaseTask {
	async handle() {
		const Task         = mongoose.model('Task');
		const serviceOrder = this.config.get('likesTask.serviceOrder');
		const service      = serviceOrder[this.taskDocument.serviceIndex];
		const likesRatio   = parseFloat(this.config.get('likesTask.likesToCheck'));
		
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
			// Успешное выполнение
			// Снимаем баллы с баланса
			if (this.account instanceof BillingAccount) {
				const quantity = service === 'likePro'
					//eslint-disable-next-line no-mixed-operators
					? Math.floor(1 / likesRatio * this.taskDocument.likesCount)
					: this.taskDocument.likesCount;
				
				const invoice = this.billing.createInvoice(
					Billing.types.like,
					quantity,
				);
				invoice.user = this.taskDocument.user;
				this.account.commitInvoice(invoice);
				await invoice.save();
				await this.taskDocument.user.save();
			}
			
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
			
			if (serviceOrder.length === this.taskDocument.serviceIndex + 1) {
				if (this.account instanceof BillingAccount) {
					const quantity = service === 'likePro'
						//eslint-disable-next-line no-mixed-operators
						? Math.floor(1 / likesRatio * this.taskDocument.likesCount)
						: this.taskDocument.likesCount;
					
					const invoice  = this.billing.createInvoice(Billing.types.like, quantity);
					this.account.rollBackInvoice(invoice);
					await this.taskDocument.user.save();
				}
				
				
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
				billing     : this.billing,
				account     : this.account,
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
