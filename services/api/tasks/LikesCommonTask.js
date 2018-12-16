import moment from 'moment';

import mongoose from '../../../lib/mongoose';
import BaseTask from './BaseTask';
import LikesTask from './LikesTask';
import TaskErrorFactory from '../api/errors/tasks/TaskErrorFactory';
import BaseTaskError from '../api/errors/tasks/BaseTaskError';
import BillingAccount from '../billing/BillingAccount';
import { NotEnoughBalanceForLikes } from '../api/errors/tasks';

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
		const LikesTaskModel = mongoose.model('LikesTask');
		const LikesCheckTaskModel = mongoose.model('LikesCheckTask');
		const TaskModel = mongoose.model('Task');
		const serviceOrder = this.config.get('likesTask.serviceOrder');
		const service = serviceOrder[serviceIndex];

		const likesTaskDocument = LikesTaskModel.createInstance({
			count: this.taskDocument.count,
			postLink: this.taskDocument.postLink,
			parentTask: this.taskDocument,
			user: this.taskDocument.user,
			status: TaskModel.status.pending,
			service,
		});

		// Потому через сервис likePro можно ставить не меньше 100 лайков
		// Пока так. Ибо дорого и не красиво на 1 сервис выставлять меньше
		// Если будет потребность придумаю решение
		if (service === 'likePro' && this.taskDocument.count < 100) {
			likesTaskDocument.count = 100;
		}

		if (this.account instanceof BillingAccount) {
			try {
				await this.account.freezeMoney(likesTaskDocument);
			} catch (error) {
				throw new NotEnoughBalanceForLikes(
					this.account.availableBalance,
					this.billing.calculatePrice(likesTaskDocument),
					this.taskDocument.postLink,
					likesTaskDocument.count,
					error,
				);
			}
		}

		this.taskDocument.subTasks.push(likesTaskDocument);
		await Promise.all([this.taskDocument.save(), likesTaskDocument.save()]);

		const likesTask = new LikesTask({
			rpcClient: this.rpcClient,
			logger: this.logger,
			config: this.config,
			taskDocument: likesTaskDocument,
			account: this.account,
			uMetrics: this.uMetrics,
		});

		this.logger.info({
			service,
			mark: 'likes',
			status: 'pending',
			try: serviceIndex,
			message: 'Запускаем задачу накрутки лайков',
			count: likesTaskDocument.count,
			postLink: likesTaskDocument.postLink,
			userId: likesTaskDocument.user.id,
			taskId: likesTaskDocument.id,
		});

		try {
			await likesTask.handle();
		} catch (error) {
			if (this.account instanceof BillingAccount) {
				await this.account.rollBack(likesTaskDocument);
			}

			throw error;
		}

		// Если задача выполнилась без ошибки
		// Коммитим транзакцию
		// И создаем задачу на проверку
		if (this.account instanceof BillingAccount) {
			await this.account.commit(likesTaskDocument);
		}

		this.taskDocument.status = TaskModel.status.checking;
		const checkDelay = this.config.get('likesTask.checkingDelay');
		const likesToCheck =
			likesTaskDocument.count * parseFloat(this.config.get('likesTask.likesToCheck'));

		this.logger.info({
			service,
			likesToCheck,
			mark: 'likes',
			status: 'success',
			try: serviceIndex,
			message: 'Выполнилась без ошибки. Создаем задачу на проверку',
			count: likesTaskDocument.count,
			postLink: likesTaskDocument.postLink,
			userId: likesTaskDocument.user.id,
			taskId: likesTaskDocument.id,
		});

		const checkTaskDocument = LikesCheckTaskModel.createInstance({
			serviceIndex,
			count: likesToCheck,
			postLink: likesTaskDocument.postLink,
			parentTask: this.taskDocument,
			user: this.taskDocument.user,
			startAt: moment().add(checkDelay, 'm'),
		});

		this.taskDocument.subTasks.push(checkTaskDocument);
		await Promise.all([this.taskDocument.save(), checkTaskDocument.save()]);
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
				mark: 'likes',
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
					'likes',
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

export default LikesCommonTask;
