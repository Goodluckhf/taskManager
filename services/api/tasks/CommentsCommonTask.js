import moment from 'moment';

import mongoose from '../../../lib/mongoose';
import BaseTask from './BaseTask';
import CommentsTask from './CommentsTask';
import TaskErrorFactory from '../api/errors/tasks/TaskErrorFactory';
import BaseTaskError from '../api/errors/tasks/BaseTaskError';
import BillingAccount from '../billing/BillingAccount';
import { NotEnoughBalanceForComments, NotEnoughBalanceForLikes } from '../api/errors/tasks';

/**
 * @property {Number} [count=0]
 * @property {Number} serviceIndex
 * @property {CommentsCommonDocument} taskDocument
 */
class CommentsCommonTask extends BaseTask {
	constructor({ count = 0, serviceIndex = 0, ...args }) {
		super(args);
		this.serviceIndex = serviceIndex;

		// Более преоритетное значение
		// Нужно что бы накруичвать после не удачной проверки уже меньшее кол-во
		this.count = count;
	}

	async createTaskAndHandle(serviceIndex) {
		const CommentsTaskModel = mongoose.model('CommentsTask');
		const CommentsCheckTaskModel = mongoose.model('CommentsCheckTask');
		const TaskModel = mongoose.model('Task');

		const serviceOrder = this.config.get('commentsTask.serviceOrder');
		const service = serviceOrder[serviceIndex];

		const commentsTaskDocument = CommentsTaskModel.createInstance({
			count: this.count || this.taskDocument.count,
			postLink: this.taskDocument.postLink,
			parentTask: this.taskDocument,
			status: TaskModel.status.pending,
			user: this.taskDocument.user,
			service,
		});

		if (this.account instanceof BillingAccount) {
			try {
				await this.account.freezeMoney(commentsTaskDocument);
			} catch (error) {
				throw new NotEnoughBalanceForComments(
					this.account.availableBalance,
					this.billing.calculatePrice(commentsTaskDocument),
					this.taskDocument.postLink,
					commentsTaskDocument.count,
					error,
				);
			}
		}

		this.taskDocument.subTasks.push(commentsTaskDocument);
		await Promise.all([this.taskDocument.save(), commentsTaskDocument.save()]);

		const commentsTask = new CommentsTask({
			rpcClient: this.rpcClient,
			logger: this.logger,
			config: this.config,
			taskDocument: commentsTaskDocument,
			account: this.account,
			uMetrics: this.uMetrics,
		});

		this.logger.info({
			service,
			mark: 'comments',
			status: 'pending',
			try: serviceIndex,
			message: 'Запускаем задачу накрутки комментов',
			count: commentsTaskDocument.count,
			postLink: commentsTaskDocument.postLink,
			userId: this.taskDocument.user.id,
			taskId: commentsTaskDocument.id,
		});

		try {
			await commentsTask.handle();
		} catch (error) {
			if (this.account instanceof BillingAccount) {
				await this.account.rollBack(commentsTaskDocument);
			}

			throw error;
		}

		// Если задача выполнилась без ошибки
		// Коммитим транзакцию
		// И создаем задачу на проверку
		if (this.account instanceof BillingAccount) {
			await this.account.commit(commentsTaskDocument);
		}

		this.taskDocument.status = TaskModel.status.checking;
		const checkDelay = this.config.get('commentsTask.checkingDelay');
		const commentsToCheck =
			this.taskDocument.count * parseFloat(this.config.get('commentsTask.commentsToCheck'));

		this.logger.info({
			service,
			commentsToCheck,
			mark: 'comments',
			status: 'success',
			try: serviceIndex,
			message: 'Выполнилась без ошибки. Создаем задачу на проверку',
			count: commentsTaskDocument.count,
			postLink: commentsTaskDocument.postLink,
			userId: this.taskDocument.user.id,
			taskId: commentsTaskDocument.id,
		});

		const checkTaskDocument = CommentsCheckTaskModel.createInstance({
			serviceIndex,
			count: commentsToCheck,
			postLink: this.taskDocument.postLink,
			parentTask: this.taskDocument,
			user: this.taskDocument.user,
			startAt: moment().add(checkDelay, 'm'),
		});
		this.taskDocument.subTasks.push(checkTaskDocument);

		await Promise.all([this.taskDocument.save(), checkTaskDocument.save()]);
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
				mark: 'comments',
				status: 'fail',
				try: serviceIndex,
				count: this.taskDocument.count,
				postLink: this.taskDocument.postLink,
				userId: this.taskDocument.user.id,
				taskId: this.taskDocument.id,
			});

			if (!(error instanceof NotEnoughBalanceForLikes)) {
				if (serviceOrder.length !== serviceIndex + 1) {
					return this.loopHandleTasks(serviceIndex + 1);
				}
			}

			// Это последний был, значит пора выкидывать ошибку
			let displayError = error;
			if (!(displayError instanceof BaseTaskError)) {
				displayError = TaskErrorFactory.createError(
					'comments',
					error,
					this.taskDocument.postLink,
					this.taskDocument.count,
				);
			}

			this.taskDocument.lastHandleAt = new Date();
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
