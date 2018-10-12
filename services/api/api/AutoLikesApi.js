import _        from 'lodash';
import mongoose from 'mongoose';

import BaseApi  from './BaseApi';
import {
	NotFound,
	ValidationError,
	TaskAlreadyExist, UserIsNotReady,
} from './errors';

/**
 * @property {VkApi} vkApi
 * @property {Billing} billing
 */
class AutoLikesApi extends BaseApi {
	constructor(vkApi, billing, ...args) {
		super(...args);
		this.vkApi   = vkApi;
		this.billing = billing;
	}
	
	/**
	 * @description Создает задание на лайкание постов по расписанию
	 * @param {BaseAccount} account
	 * @param {Object} _data
	 * @param {String} [_data.groupId] Если groupId нет - будет создана новая группа
	 * @param {String} _data.publicHref
	 * @param {String} _data.admin
	 * @param {Number} _data.likesCount
	 * @param {Number} _data.commentsCount
	 * @param {Number} _data.repostsCount
	 * @return {Promise<*>}
	 */
	async create(account, _data) {
		const data = { ..._data };
		this.validate({
			properties: {
				likesCount   : { oneOf: [{ type: 'string' }, { type: 'number' }] }, // @TODO: Разобраться, чтобы сам конверитил в int
				commentsCount: { oneOf: [{ type: 'string' }, { type: 'number' }] },
				repostsCount : { oneOf: [{ type: 'string' }, { type: 'number' }] },
				publicHref   : { type: 'string' },
				admin        : { type: 'string' },
				groupId      : { type: 'string' },
			},
			required: ['likesCount', 'commentsCount', 'repostsCount'],
		}, data);
		
		if (!data.groupId && !data.publicHref) {
			throw new ValidationError(['groupId', 'publicHref']);
		}
		
		if (parseInt(data.likesCount, 10) === 0
			&& parseInt(data.commentsCount, 10) === 0
			&& parseInt(data.repostsCount, 10) === 0) {
			throw new ValidationError(['commentsCount', 'likesCount', 'repostsCount']);
		}
		
		if (!account.user.chatId) {
			throw new UserIsNotReady(['chatId']);
		}
		
		const invoices = [
			this.billing.createInvoice('like', parseInt(data.likesCount, 10)),
			this.billing.createInvoice('repost', parseInt(data.repostsCount, 10)),
			this.billing.createInvoice('comment', parseInt(data.commentsCount, 10)),
		];
		
		account.canPay(invoices);
		
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
			user     : account.user,
			group    : group._id,
			deletedAt: null,
		});
		
		if (existsTask) {
			throw new TaskAlreadyExist({ id: existsTask.id, groupId: group.id });
		}
		
		try {
			const likesTask = mongoose.model('AutoLikesTask').createInstance({
				...data,
				user : account.user,
				group: group._id,
			});
			await likesTask.save();
			return {
				...likesTask.toObject(),
				group: {
					...group.toObject(),
					isTarget: !!account.user.targetGroups.find(_id => _id.equals(group._id)),
				},
			};
		} catch (error) {
			throw (new ValidationError(data)).combine({ error });
		}
	}
	
	/**
	 * @description Список задач
	 * @property {String} filter
	 * @property {UserDocument} user
	 * @return {Promise<*>}
	 */
	// eslint-disable-next-line class-methods-use-this
	async list({ filter = 'all', user } = {}) {
		const LikesTask = mongoose.model('AutoLikesTask');
		const query     = { deletedAt: null };
		
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
		query.user = user;
		const likeTasks = await LikesTask
			.find(query)
			.sort({ createdAt: -1 })
			.populate('group')
			.populate({
				path   : 'subTasks',
				options: {
					limit: 3,
					sort : { createdAt: -1 },
				},
			})
			.lean()
			.exec();
		
		const likeTasksWithUniqSubTasks = likeTasks.map((task) => {
			//eslint-disable-next-line no-param-reassign
			task.subTasks = _.uniqWith(task.subTasks, (task1, task2) => (
				task1.__t === task2.__t
			));
			return task;
		});
		
		const idsHash = user.targetGroups.reduce((obj, id) => {
			return {
				...obj,
				[id.toString()]: true,
			};
		}, {});
		
		
		return likeTasksWithUniqSubTasks.map((taks) => {
			//eslint-disable-next-line no-param-reassign
			taks.group.isTarget = !!idsHash[taks.group._id];
			return taks;
		});
	}
	
	/**
	 * TODO: Добавить пользователя
	 * @description Обновляет задание
	 * @param {String} _id
	 * @param {Object} _data
	 * @param {String} _data.groupId
	 * @param {Number} _data.likesCount
	 * @param {Number} _data.commentsCount
	 * @param {Number} _data.repostsCount
	 * @return {Promise<*>}
	 */
	async update(_id, _data) {
		const data = { ..._data };
		
		this.validate({
			properties: {
				groupId      : { type: 'string' },
				likesCount   : { oneOf: [{ type: 'string' }, { type: 'number' }] }, // @TODO: Разобраться, чтобы сам конверитил в int
				commentsCount: { oneOf: [{ type: 'string' }, { type: 'number' }] }, // @TODO: Разобраться, чтобы сам конверитил в int
				repostsCount : { oneOf: [{ type: 'string' }, { type: 'number' }] }, // @TODO: Разобраться, чтобы сам конверитил в int
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
}

export default AutoLikesApi;
