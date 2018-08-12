import mongoose                      from 'mongoose';
import { NotFound, ValidationError } from './errors';
import BaseApi                       from './BaseApi';

class TaskApi extends BaseApi {
	/**
	 * @description Создает задание на лайкание постов по расписанию
	 * @param {Object} data
	 * @param {String} [data.publicId] Если publicId нет - будет создана новая группа
	 * @param {String} data.publicHref
	 * @param {String} data.admin
	 * @param {String} data.targetLink
	 * @param {Number} data.likesCount
	 * @param {String} data.schedule
	 * @return {Promise<*>}
	 */
	async createLikes(data) {
		this.validate({
			properties: {
				targetLink: { type: 'string' },
				likesCount: { type: 'string' }, // @TODO: Разобраться, чтобы сам конверитил в int
				schedule  : { type: 'string' },
				publicHref: { type: 'string' },
				admin     : { type: 'string' },
				publicId  : { type: 'string' },
			},
			required: ['targetLink', 'likesCount', 'schedule'],
		}, data);
		
		if (!data.publicId && !data.publicHref) {
			throw new ValidationError(['publicId', 'publicHref']);
		}
		
		let group;
		if (data.publicHref) {
			const vkGroup = await this.vkApi.groupByHref(data.publicHref);
			this.logger.info({
				vkGroup,
			});
			group = await mongoose.model('Group').findOrCreateById(vkGroup.id, vkGroup);
		} else {
			group = await mongoose.model('Group').findOne({ publicId: data.publicId });
			if  (!group) {
				throw new NotFound();
			}
		}
		
		try {
			const likesTask = mongoose.model('LikesTask').createInstance({
				...data,
				publicId: group._id,
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
	 * @description Список актуальных задач
	 * @return {Promise<*>}
	 */
	// eslint-disable-next-line class-methods-use-this
	async getActual() {
		const LikesTask = mongoose.model('LikesTask');
		const likeTasks = await LikesTask.find({
			$or: [
				{ status: LikesTask.status.waiting },
				{ status: LikesTask.status.pending },
			],
		});
		
		const groupIds = likeTasks.map(task => task.publicId);
		const groups = await mongoose.model('Group').find({
			_id: { $in: groupIds },
		});
		
		const groupsHash = groups.reduce((hash, group) => {
			return {
				...hash,
				[group.id]: group.toObject(),
			};
		}, {});
		
		return likeTasks.map((task) => {
			return {
				...task.toObject(),
				group: groupsHash[task.publicId.toString()],
			};
		});
	}
	
	
	/**
	 * @description Обновляет задание
	 * @param {String} _id
	 * @param {Object} data
	 * @param {String} data.publicId
	 * @param {String} data.targetLink
	 * @param {Number} data.likesCount
	 * @param {String} data.schedule
	 * @return {Promise<*>}
	 */
	async updateLikes(_id, data) {
		this.validate({
			properties: {
				publicId  : { type: 'string' },
				targetLink: { type: 'string' },
				likesCount: { type: 'string' }, // @TODO: Разобраться, чтобы сам конверитил в int
				schedule  : { type: 'string' },
			},
		}, data);
		
		const likesTask = await mongoose.model('LikesTask').findOne({ _id });
		
		if (!likesTask) {
			throw new NotFound({ query: { _id: _id.toString() }, what: 'LikesTask' });
		}
		
		const group = await mongoose.model('Group').findOne({ _id: data.publicId || likesTask.publicId });
		if (data.publicId && !group) {
			throw new NotFound({ query: { _id: data.publicId.toString() }, what: 'Group' });
		}
		
		if (!likesTask.active) {
			// @TODO: Пока бросаю ошибку валидации, потом сделать нормально
			throw (new ValidationError({ likesTaskId: _id })).combine({ message: 'Задачу уже нельзя изменять' });
		}
		
		likesTask.fill(data);
		await likesTask.save();
		
		return {
			...likesTask.toObject(),
			group: group.toObject(),
		};
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
		
		const task = await mongoose.model('LikesTask').findOne({ _id });
		if (!task) {
			throw new NotFound({ query: { _id }, what: 'LikesTask' });
		}
		
		if (!task.active) {
			// @TODO: Пока бросаю ошибку валидации, потом сделать нормально
			throw (new ValidationError({ likesTaskId: _id })).combine({ message: 'Задачу уже нельзя остановить' });
		}
		
		await task.stop().save();
	}
}

export default TaskApi;
