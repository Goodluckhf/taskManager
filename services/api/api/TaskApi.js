import mongoose  from 'mongoose';
import bluebird  from 'bluebird';

import {
	NotFound,
	ValidationError,
} from './errors';

import BaseApi           from './BaseApi';
import AutoLikesTask     from '../tasks/AutolikesTask';
import gracefulStop      from '../../../lib/GracefulStop';
import LikesCheckTask    from '../tasks/LikesCheckTask';
import CommentsCheckTask from '../tasks/CommentsCheckTask';
import RepostsCheckTask  from '../tasks/RepostsCheckTask';
import CheckWallBanTask  from '../tasks/CheckWallBanTask';

gracefulStop.setWaitor('handleActiveTasks');

// Маппер по ключу типа дискриминатора
// Выдает класс задачи
const mapperModelTypeToTask = {
	AutoLikesTask,
	LikesCheckTask,
	CommentsCheckTask,
	RepostsCheckTask,
	CheckWallBanTask,
};

/**
 * @property {RpcClient} rpcClient
 * @property {Alert} alert
 */
class TaskApi extends BaseApi {
	constructor(rpcClient, alert, ...args) {
		super(...args);
		this.rpcClient = rpcClient;
		this.alert     = alert;
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
			throw (new ValidationError({ likesTaskId: _id })).combine({ message: 'Задачу уже нельзя остановить' });
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
		
		const task = await mongoose
			.model('Task')
			.findOne({ _id, user })
			.populate({
				path    : 'subTasks',
				options : { lean: true },
				populate: {
					path   : 'subTasks',
					options: { lean: true },
				},
			})
			.lean()
			.exec();
		
		if (!task) {
			return;
		}
		
		const tasksToRemove = task.subTasks.reduce((array, subTask) => {
			array.push(subTask._id);
			if (!subTask.subTasks.length) {
				return array;
			}
			
			return subTask.subTasks.reduce((_array, _subTask) => {
				_array.push(_subTask._id);
				return _array;
			}, array);
		}, [task._id]);
		
		await mongoose.model('Task').deleteMany({ _id: { $in: tasksToRemove } });
	}
	
	/**
	 * @description Выполняет актуальные задачи (используется в кроне)
	 * @return {Promise<*>}
	 */
	async handleActiveTasks() {
		if (gracefulStop.isStopping) {
			this.logger.warn({
				message: 'method call during graceful stopping',
				method : 'TaskApi.handleActive',
			});
			return;
		}
		
		gracefulStop.setProcessing('handleActiveTasks');
		const Task  = mongoose.model('Task');
		const tasks = await Task.findActive();
		// Задачи просто запускаются
		// Не ждем пока они выполнятся
		// Главное обработать ошибку и отослать алерт
		bluebird.map(
			tasks,
			async (_task) => {
				//eslint-disable-next-line no-param-reassign
				_task.status = Task.status.pending;
				await _task.save();
				const TaskClass = mapperModelTypeToTask[_task.__t];
				
				if (!TaskClass) {
					this.logger.warn({
						message: 'task is not instance of BaseTask',
						task   : _task.toObject(),
					});
					return;
				}
				
				const task = new TaskClass({
					logger      : this.logger,
					taskDocument: _task,
					rpcClient   : this.rpcClient,
					config      : this.config,
				});
				
				// eslint-disable-next-line consistent-return
				return task.handle().catch((errors) => {
					if (!Array.isArray(errors)) {
						// eslint-disable-next-line no-param-reassign
						errors = [errors];
					}
					
					return bluebird.map(
						errors,
						error => this.alert.sendError(error, _task.user.chatId),
					);
				});
			},
		).then(() => {
			// Graceful reload
			gracefulStop.setReady('handleActiveTasks');
		});
	}
}

export default TaskApi;
