import mongoose  from 'mongoose';
import bluebird  from 'bluebird';
import moment    from 'moment';
import { JSDOM } from 'jsdom';

import { NotFound, TaskApiError, ValidationError } from './errors';
import BaseApi                                     from './BaseApi';
import LikeRequest                                 from './amqpRequests/LikeRequest';

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
				likesCount: { type: 'string' }, // @TODO: Разобраться, чтобы сам конверитил в int
				publicHref: { type: 'string' },
				admin     : { type: 'string' },
				groupId   : { type: 'string' },
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
			const likesTask = mongoose.model('LikesTask').createInstance({
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
		}).populate('group').exec();
		
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
				groupId   : { type: 'string' },
				likesCount: { type: 'string' }, // @TODO: Разобраться, чтобы сам конверитил в int
			},
		}, data);
		
		const likesTask = await mongoose
			.model('LikesTask')
			.findOne({ _id })
			.exec();
		
		if (!likesTask) {
			throw new NotFound({ query: { _id: _id.toString() }, what: 'LikesTask' });
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
	//@TODO: Проверить что map вернет при ошибке
	async handleActiveTasks() {
		const Group = mongoose.model('Group');
		const tasks = await mongoose.model('LikesTask').findActive();
		return bluebird.map(
			tasks,
			async (task) => {
				// Проверяем, что прошло 70 минут, чтобы не лайкать уже лайкнутый пост
				const likesInterval = parseInt(this.config.get('likesTask.likesInterval'), 10);
				if (moment().diff(moment(task.lastLikedAt), 'minutes') < likesInterval) {
					return;
				}
				
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
				
				const result = await this.rpcClient.call(request);
				
				if (result.error) {
					throw new TaskApiError(request, result.error);
				}
				
				//eslint-disable-next-line no-param-reassign
				task.lastLikedAt = new Date();
				await task.save();
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
