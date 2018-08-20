import mongoose                      from 'mongoose';
import bluebird                      from 'bluebird';
import { JSDOM }                     from 'jsdom';

import { NotFound, ValidationError } from './errors';
import BaseApi                       from './BaseApi';
import LikeRequest                   from './amqpRequests/LikeRequest';

/**
 * @property {RpcClient} rpcClient
 */
class TaskApi extends BaseApi {
	constructor(rpcClient, ...args) {
		super(...args);
		this.rpcClient = rpcClient;
	}
	
	/**
	 * @description Создает задание на лайкание постов по расписанию
	 * @param {Object} _data
	 * @param {String} [_data.publicId] Если publicId нет - будет создана новая группа
	 * @param {String} _data.publicHref
	 * @param {String} _data.admin
	 * @param {Number} _data.likesCount
	 * @return {Promise<*>}
	 */
	async createLikes(_data) {
		const data = { ..._data };
		this.validate({
			properties: {
				likesCount: { type: 'string' }, // @TODO: Разобраться, чтобы сам конверитил в int
				publicHref: { type: 'string' },
				admin     : { type: 'string' },
				publicId  : { type: 'string' },
			},
			required: ['likesCount'],
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
			group = await mongoose.model('Group').findOrCreateByPublicId(vkGroup.id, vkGroup);
		} else {
			group = await mongoose.model('Group').findOne({ _id: data.publicId });
			if  (!group) {
				throw new NotFound({
					what : 'Group',
					query: { _id: data.publicId },
				});
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
		
		// Собираем группы по publicId
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
	 * @param {Object} _data
	 * @param {String} _data.publicId
	 * @param {Number} _data.likesCount
	 * @return {Promise<*>}
	 */
	async updateLikes(_id, _data) {
		const data = { ..._data };
		
		this.validate({
			properties: {
				publicId  : { type: 'string' },
				likesCount: { type: 'string' }, // @TODO: Разобраться, чтобы сам конверитил в int
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
	
	/**
	 * @description Выполняет актуальные задачи (используется в кроне)
	 * @return {Promise<*>}
	 */
	//@TODO: Вынести в отдельный класс для тасков
	async handleActiveTasks() {
		const Group = mongoose.model('Group');
		const tasks = await mongoose.model('LikesTask').findActive();
		return bluebird.map(
			tasks,
			async (task) => {
				const group = await Group.findOne({
					_id: task.publicId,
				}).lean().exec();
				
				const targetPublics = await mongoose
					.model('Group')
					.find({ isTarget: true })
					.lean()
					.exec();
				
				if (!targetPublics.length) {
					return;
				}
				
				const link  = Group.getLinkByPublicId(group.publicId);
				const jsDom = await JSDOM.fromURL(link);
				
				const $mentionLink = jsDom.window.document.querySelectorAll('#page_wall_posts .post .wall_post_text a.mem_link')[0];
				if (!$mentionLink) {
					return;
				}
				
				// Ссылка на пост
				const $post    = jsDom.window.document.querySelectorAll('#page_wall_posts .post')[0];
				const $postId  = $post.attributes.getNamedItem('data-post-id');
				const postLink = Group.getPostLinkById($postId.value);
				
				const mentionId  = $mentionLink.attributes.getNamedItem('mention_id');
				
				const hasTargetGroupInTask = targetPublics.some((targetGroup) => {
					return `club${targetGroup.publicId}` === mentionId.value;
				});
				
				if (!hasTargetGroupInTask) {
					return;
				}
				
				const request = new LikeRequest(this.config, {
					postLink,
					likesCount: task.likesCount,
				});
				this.logger.info({ request });
				
				//eslint-disable-next-line consistent-return
				return this.rpcClient.call(request);
			},
		);
	}
}

export default TaskApi;
