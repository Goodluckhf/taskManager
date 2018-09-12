import mongoose  from 'mongoose';
import bluebird  from 'bluebird';

import {
	NotFound,
	TaskApiError,
	ValidationError,
} from './errors';

import BaseApi       from './BaseApi';
import LikeRequest   from './amqpRequests/LikeRequest';
import AutoLikesTask from '../tasks/AutolikesTask';

/**
 * @property {RpcClient} rpcClient
 * @property {VkApi} vkApi
 */
class TaskApi extends BaseApi {
	constructor(rpcClient, vkApi, ...args) {
		super(...args);
		this.rpcClient = rpcClient;
		this.vkApi     = vkApi;
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
					limit: 1,
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
			throw new NotFound({ query: { _id }, what: 'LikesTask' });
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
			throw new NotFound({ query: { _id }, what: 'LikesTask' });
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
		const tasks = await mongoose.model('Task').findActive();
		return bluebird.map(
			tasks,
			async (_task) => {
				let task;
				if (_task.__t === 'AutoLikesTask') {
					task = new AutoLikesTask(this.vkApi, this.logger, _task, this.rpcClient, this.config);
				}
				
				return task.handle();
			},
		);
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
