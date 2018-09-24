import mongoose  from 'mongoose';
import bluebird  from 'bluebird';

import {
	NotFound, TaskAlreadyExist,
	TaskApiError,
	ValidationError,
} from './errors';

import BaseApi           from './BaseApi';
import LikeRequest       from './amqpRequests/LikeRequest';
import AutoLikesTask     from '../tasks/AutolikesTask';
import gracefulStop      from '../../../lib/GracefulStop';
import LikesCheckTask    from '../tasks/LikesCheckTask';
import CommentsCheckTask from '../tasks/CommentsCheckTask';

gracefulStop.setWaitor('handleActiveTasks');

// Маппер по ключу типа дискриминатора
// Выдает класс задачи
const mapperModelTypeToTask = {
	AutoLikesTask,
	LikesCheckTask,
	CommentsCheckTask,
};

/**
 * @property {RpcClient} rpcClient
 * @property {VkApi} vkApi
 * @property {Alert} alert
 */
class TaskApi extends BaseApi {
	constructor(rpcClient, vkApi, alert, ...args) {
		super(...args);
		this.rpcClient = rpcClient;
		this.vkApi     = vkApi;
		this.alert     = alert;
	}
	
	/**
	 * @description Создает задание на лайкание постов по расписанию
	 * @param {Object} _data
	 * @param {String} [_data.groupId] Если groupId нет - будет создана новая группа
	 * @param {String} _data.publicHref
	 * @param {String} _data.admin
	 * @param {Number} _data.likesCount
	 * @return {Promise<*>}
	 */
	async createLikes(_data) {
		const data = { ..._data };
		this.validate({
			properties: {
				likesCount   : { oneOf: [{ type: 'string' }, { type: 'number' }] }, // @TODO: Разобраться, чтобы сам конверитил в int
				commentsCount: { oneOf: [{ type: 'string' }, { type: 'number' }] },
				publicHref   : { type: 'string' },
				admin        : { type: 'string' },
				groupId      : { type: 'string' },
			},
			required: ['likesCount'],
		}, data);
		
		if (!data.groupId && !data.publicHref) {
			throw new ValidationError(['groupId', 'publicHref']);
		}
		
		let group;
		if (data.publicHref) {
			const vkGroup = await this.vkApi.groupByHref(data.publicHref);
			this.logger.info({
				vkGroup,
			});
			group = await mongoose.model('Group').findOrCreateByPublicId(vkGroup.id, vkGroup);
		} else {
			group = await mongoose.model('Group').findOne({ _id: data.groupId });
			if  (!group) {
				throw new NotFound({
					what : 'Group',
					query: { _id: data.groupId },
				});
			}
		}
		
		const existsTask = await mongoose.model('AutoLikesTask').findOne({
			group : group._id,
			status: mongoose.model('Task').status.waiting,
		});
		
		if (existsTask) {
			throw new TaskAlreadyExist({ id: existsTask.id, groupId: group.id });
		}
		
		try {
			const likesTask = mongoose.model('AutoLikesTask').createInstance({
				...data,
				group: group._id,
			});
			await likesTask.save();
			return {
				...likesTask.toObject(),
				group: group.toObject(),
			};
		} catch (error) {
			throw (new ValidationError(data)).combine({ error });
		}
	}
	
	/**
	 * @description Список задач
	 * @return {Promise<*>}
	 */
	// eslint-disable-next-line class-methods-use-this
	async list({ filter = 'all' } = {}) {
		const LikesTask = mongoose.model('AutoLikesTask');
		const query = {};
		
		if (filter === 'active') {
			query.$or = [
				{ status: LikesTask.status.waiting },
				{ status: LikesTask.status.pending },
			];
		} else if (filter === 'inactive') {
			query.$or = [
				{ status: LikesTask.status.skipped },
				{ status: LikesTask.status.finished },
			];
		}
		
		const likeTasks = await LikesTask
			.find(query)
			.sort({ createdAt: -1 })
			.populate('group')
			.populate({
				path   : 'subTasks',
				options: {
					limit: 2,
					sort : { createdAt: -1 },
				},
			})
			.exec();
		
		return likeTasks.map(task => task.toObject());
	}
	
	
	/**
	 * @description Обновляет задание
	 * @param {String} _id
	 * @param {Object} _data
	 * @param {String} _data.groupId
	 * @param {Number} _data.likesCount
	 * @return {Promise<*>}
	 */
	async updateLikes(_id, _data) {
		const data = { ..._data };
		
		this.validate({
			properties: {
				groupId      : { type: 'string' },
				likesCount   : { oneOf: [{ type: 'string' }, { type: 'number' }] }, // @TODO: Разобраться, чтобы сам конверитил в int
				commentsCount: { oneOf: [{ type: 'string' }, { type: 'number' }] }, // @TODO: Разобраться, чтобы сам конверитил в int
			},
		}, data);
		
		const likesTask = await mongoose
			.model('AutoLikesTask')
			.findOne({ _id })
			.exec();
		
		if (!likesTask) {
			throw new NotFound({ query: { _id }, what: 'LikesCommonTask' });
		}
		
		const group = await mongoose.model('Group').findOne({ _id: data.groupId || likesTask.group });
		if (data.groupId && !group) {
			throw new NotFound({ query: { _id: data.groupId }, what: 'Group' });
		}
		
		if (!likesTask.active) {
			// @TODO: Пока бросаю ошибку валидации, потом сделать нормально
			throw (new ValidationError({ likesTaskId: _id })).combine({ message: 'Задачу уже нельзя изменять' });
		}
		
		likesTask.fill(data);
		await likesTask.save();
		await likesTask.populate('group').execPopulate();
		return likesTask.toObject();
	}
	
	/**
	 * @description Останавливает задачу
	 * @param {String} _id
	 */
	// eslint-disable-next-line class-methods-use-this
	async stop(_id) {
		if (!_id) {
			throw new ValidationError({ _id });
		}
		
		const task = await mongoose.model('AutoLikesTask').findOne({ _id });
		if (!task) {
			throw new NotFound({ query: { _id }, what: 'LikesCommonTask' });
		}
		
		if (!task.active) {
			// @TODO: Пока бросаю ошибку валидации, потом сделать нормально
			throw (new ValidationError({ likesTaskId: _id })).combine({ message: 'Задачу уже нельзя остановить' });
		}
		
		await task.stop().save();
	}
	
	/**
	 * @description Удаляет задачу
	 * @param {String} _id
	 * @return {Promise<void>}
	 */
	// eslint-disable-next-line class-methods-use-this
	async remove(_id) {
		if (!_id) {
			throw new ValidationError({ _id });
		}
		
		return mongoose.model('AutoLikesTask').deleteOne({ _id });
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
						error => this.alert.sendError(error, this.config.get('vkAlert.chat_id')),
					);
				});
			},
		).then(() => {
			// Graceful reload
			gracefulStop.setReady('handleActiveTasks');
		});
	}
	
	/**
	 * Ставит лайки для поста
	 * @param {Object} data
	 * @param {String} data.postLink
	 * @param {Number} data.likesCount
	 * @return {Promise<*>}
	 */
	async setLikes(data) {
		this.validate({
			properties: {
				postLink  : { type: 'string' },
				likesCount: { type: 'string' }, // @TODO: Разобраться, чтобы сам конверитил в int
			},
			required: ['postLink', 'likesCount'],
		}, data);
		
		const request = new LikeRequest(this.config, {
			postLink  : data.postLink,
			likesCount: data.likesCount,
		});
		this.logger.info({ request });
		
		const result = await this.rpcClient.call(request);
		
		if (result.error) {
			throw new TaskApiError(request, result.error);
		}
		
		return result.success;
	}
}

export default TaskApi;
