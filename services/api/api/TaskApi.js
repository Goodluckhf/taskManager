import bluebird from 'bluebird';
import moment from 'moment';

import mongoose from '../../../lib/mongoose';
import { CantRemovePendingTask, NotFound, ValidationError } from './errors';

import BaseApi from './BaseApi';
import AutoLikesTask from '../tasks/AutolikesTask';
import gracefulStop from '../../../lib/GracefulStop';
import LikesCheckTask from '../tasks/LikesCheckTask';
import CommentsCheckTask from '../tasks/CommentsCheckTask';
import RepostsCheckTask from '../tasks/RepostsCheckTask';
import CheckWallBanTask from '../tasks/CheckWallBanTask';
import BaseTaskError from './errors/tasks/BaseTaskError';
import TaskErrorFactory from './errors/tasks/TaskErrorFactory';
import CheckBalanceTask from '../tasks/CheckBalanceTask';
import CommentsByStrategyTask from '../tasks/CommentsByStrategyTask';
import CheckAndAddUsersTask from '../tasks/CheckAndAddUsersTask';

gracefulStop.setWaitor('handleActiveTasks');

// Маппер по ключу типа дискриминатора
// Выдает класс задачи
const mapperModelTypeToTask = {
	AutoLikesTask,
	LikesCheckTask,
	CommentsCheckTask,
	RepostsCheckTask,
	CheckWallBanTask,
	CheckBalanceTask,
	CommentsByStrategyTask,
	CheckAndAddUsersTask,
};

/**
 * @property {RpcClient} rpcClient
 * @property {Alert} alert
 * @property {Billing} billing
 * @property {UMetrics} uMetrics
 */
class TaskApi extends BaseApi {
	constructor(likeService, commentsService, rpcClient, alert, billing, uMetrics, ...args) {
		super(...args);
		this.likeService = likeService;
		this.commentsService = commentsService;
		this.rpcClient = rpcClient;
		this.alert = alert;
		this.billing = billing;
		this.uMetrics = uMetrics;
	}

	/**
	 * @description Останавливает задачу
	 * @param {String} _id
	 * @param {UserDocument} user
	 */
	// eslint-disable-next-line class-methods-use-this
	async stop(_id, user) {
		if (!_id) {
			throw new ValidationError({ _id });
		}

		const task = await mongoose.model('Task').findOne({ _id, user });
		if (!task) {
			throw new NotFound({ query: { _id }, what: 'Task' });
		}

		if (!task.active) {
			// @TODO: Пока бросаю ошибку валидации, потом сделать нормально
			throw new ValidationError({ likesTaskId: _id }).combine({
				message: 'Задачу уже нельзя остановить',
			});
		}

		await task.stop().save();
	}

	/**
	 * @description Удаляет задачу и все подзадачи
	 * @param {String} _id
	 * @param {UserDocument} user
	 * @return {Promise<void>}
	 */
	// eslint-disable-next-line class-methods-use-this
	async remove(_id, user) {
		if (!_id) {
			throw new ValidationError({ _id });
		}

		const TaskModel = mongoose.model('Task');

		const task = await TaskModel.findOne({ _id, user })
			.populate({
				path: 'subTasks',
				options: { lean: true },
				populate: {
					path: 'subTasks',
					options: { lean: true },
				},
			})
			.lean()
			.exec();

		if (!task) {
			return;
		}

		const hasPendingSubTask = task.subTasks.some(
			_task => _task.status === mongoose.model('Task').status.pending,
		);

		if (hasPendingSubTask) {
			throw new CantRemovePendingTask();
		}

		const tasksToRemove = task.subTasks.reduce(
			(array, subTask) => {
				array.push(subTask._id);
				if (!subTask.subTasks.length) {
					return array;
				}

				return subTask.subTasks.reduce((_array, _subTask) => {
					_array.push(_subTask._id);
					return _array;
				}, array);
			},
			[task._id],
		);

		await TaskModel.update(
			{ _id: { $in: tasksToRemove } },
			{ deletedAt: moment.now() },
			{ multi: true },
		);
	}

	/**
	 * @description Выполняет актуальные задачи (используется в кроне)
	 * @return {Promise<*>}
	 */
	async handleActiveTasks() {
		if (gracefulStop.isStopping) {
			this.logger.warn({
				message: 'method call during graceful stopping',
				method: 'TaskApi.handleActive',
			});
			return;
		}

		gracefulStop.setProcessing('handleActiveTasks');
		const Task = mongoose.model('Task');
		const tasks = await Task.findActive();
		// Задачи просто запускаются
		// Не ждем пока они выполнятся
		// Главное обработать ошибку и отослать алерт
		bluebird
			.map(tasks, async _task => {
				const startTime = new Date();
				try {
					//eslint-disable-next-line no-param-reassign
					_task.status = Task.status.pending;
					await _task.save();
					const TaskClass = mapperModelTypeToTask[_task.__t];

					if (!TaskClass) {
						this.logger.warn({
							message: 'task is not instance of BaseTask',
							task: _task.toObject(),
						});
						return;
					}

					const task = new TaskClass({
						likeService: this.likeService,
						commentsService: this.commentsService,
						VkUser: this.VkUser,
						Proxy: this.Proxy,
						billing: this.billing,
						account: this.billing.createAccount(_task.user),
						logger: this.logger,
						taskDocument: _task,
						rpcClient: this.rpcClient,
						config: this.config,
						alert: this.alert,
						uMetrics: this.uMetrics,
					});

					await task.handle(_task.toObject());
					try {
						this.uMetrics.taskSuccessCount.inc(1, { task_type: _task.__t });
					} catch (error) {
						this.logger.error({
							mark: 'uMetrics',
							message: 'unexpected error',
							error,
						});
					}
				} catch (errors) {
					if (!Array.isArray(errors)) {
						// eslint-disable-next-line no-ex-assign
						errors = [errors];
					}

					await bluebird.map(errors, async error => {
						try {
							try {
								this.uMetrics.taskErrorCount.inc(1, { task_type: _task.__t });
							} catch (_error) {
								this.logger.error({
									mark: 'uMetrics',
									message: 'unexpected error',
									error: _error,
								});
							}
							// Не предвиденная ошибка
							if (!(error instanceof BaseTaskError)) {
								//eslint-disable-next-line no-param-reassign
								error = TaskErrorFactory.createError('default', error);
								this.logger.error({
									message: 'Fatal error при выполении задач',
									taskId: _task.id,
									userId: _task.user.id,
									error,
								});
							} else {
								this.logger.error({
									message: 'Ошибки при выполнении задачи',
									taskId: _task.id,
									userId: _task.user.id,
									error,
								});
							}
							// await this.alert.sendError(error.toMessageString(), _task.user.chatId);
						} catch (_error) {
							this.logger.error({
								message: 'fatal error',
								error: _error,
								userId: _task.user.id,
								taskId: _task.id,
							});
						}
					});
				} finally {
					try {
						const taskDuration = Date.now() - startTime;
						this.uMetrics.taskDuration.inc(taskDuration, { task_type: _task.__t });
					} catch (error) {
						this.logger.error({
							mark: 'uMetrics',
							message: 'unexpected error',
							error,
						});
					}
				}
			})
			.then(() => {
				// Graceful reload
				gracefulStop.setReady('handleActiveTasks');
			});
	}
}

export default TaskApi;
