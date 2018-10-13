import moment from 'moment';

import mongoose                                       from '../../../lib/mongoose';
import BaseTask                                       from './BaseTask';
import LikesTask                                      from './LikesTask';
import TaskErrorFactory                               from '../api/errors/tasks/TaskErrorFactory';
import BaseTaskError                                  from '../api/errors/tasks/BaseTaskError';
import BillingAccount                                 from '../billing/BillingAccount';
import Billing                                        from '../billing/Billing';
import { NotEnoughBalance, NotEnoughBalanceForLikes } from '../api/errors/tasks';

/**
 * @property {Number} serviceIndex
 * @property {LikesCommonDocument} taskDocument
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
		
		// Потому через сервис likePro можно ставить не меньше 100 лайков
		let { likesCount } = this.taskDocument;
		if (service === 'likePro' && likesCount < 100) {
			if (this.account instanceof BillingAccount) {
				const invoice = this.billing.createInvoice(Billing.types.like, 100 - likesCount);
				try {
					this.account.freezeMoney(invoice);
					await this.taskDocument.user.save();
				} catch (error) {
					if (error instanceof NotEnoughBalance) {
						throw new NotEnoughBalanceForLikes(
							this.account.availableBalance,
							invoice.price,
							this.taskDocument.postLink,
							this.taskDocument.likesCount,
							error,
						);
					}
					
					throw error;
				}
			}
			
			likesCount = 100;
		}
		
		const likesTaskDocument = LikesTaskModel.createInstance({
			likesCount,
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
		
		this.logger.info({
			service,
			mark      : 'likes',
			message   : 'Запускаем задачу накрутки лайков',
			likesCount: this.taskDocument.likesCount,
			postLink  : this.taskDocument.postLink,
			userId    : this.taskDocument.user.id,
			taskId    : this.taskDocument.id,
		});
		
		await likesTask.handle();
		
		// Если задача выполнилась без ошибки
		// То создаем задачу на проверку
		this.taskDocument.status = TaskModel.status.checking;
		const checkDelay   = this.config.get('likesTask.checkingDelay');
		const likesToCheck = likesCount * parseFloat(this.config.get('likesTask.likesToCheck'));
		
		this.logger.info({
			service,
			likesToCheck,
			mark      : 'likes',
			message   : 'Выполнилась без ошибки. Создаем задачу на проверку',
			likesCount: this.taskDocument.likesCount,
			postLink  : this.taskDocument.postLink,
			userId    : this.taskDocument.user.id,
			taskId    : this.taskDocument.id,
		});
		
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
			
			if (service === 'likePro' && this.account instanceof BillingAccount) {
				const quantity = 100 - this.taskDocument.likesCount;
				const invoice  = this.billing.createInvoice(Billing.types.like, quantity);
				this.account.rollBackInvoice(invoice);
				await this.taskDocument.user.save();
			}
			
			if (serviceOrder.length !== serviceIndex + 1) {
				return this.loopHandleTasks(serviceIndex + 1);
			}
			
			if (this.account instanceof BillingAccount) {
				const invoice = this.billing.createInvoice(
					Billing.types.like,
					this.taskDocument.likesCount,
				);
				
				this.account.rollBackInvoice(invoice);
				await this.taskDocument.user.save();
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

export default LikesCommonTask;
