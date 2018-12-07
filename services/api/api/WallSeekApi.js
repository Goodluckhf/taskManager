import mongoose from '../../../lib/mongoose';
import BaseApi from './BaseApi';
import { NotFound, WallSeekAlreadyExist } from './errors';

/**
 * @property {VkApi} vkApi
 */
class WallSeekApi extends BaseApi {
	constructor(vkApi, ...args) {
		super(...args);
		this.vkApi = vkApi;
	}

	/**
	 * @description Добавляет новую задачу на слежку группы на бан ссылок
	 * @param {Object} data
	 * @param {String} data.link
	 * @param {Number} data.postCount
	 * @param {UserDocument} data.user
	 */
	async add(data) {
		const Group = mongoose.model('Group');
		const CheckWallBanTask = mongoose.model('CheckWallBanTask');

		this.validate(
			{
				properties: {
					link: { type: 'string' },
					postCount: { oneOf: [{ type: 'string' }, { type: 'number' }] },
				},
				required: ['link', 'postCount'],
			},
			data,
		);
		this.checkUserReady(data.user);
		const vkGroup = await this.vkApi.groupByHref(data.link);
		const group = await Group.findOrCreateByPublicId(vkGroup.id, vkGroup);
		const count = await CheckWallBanTask.count({ group: group._id, user: data.user });

		if (count) {
			throw new WallSeekAlreadyExist({
				link: data.link,
				id: group._id,
			});
		}

		const task = CheckWallBanTask.createInstance({
			postCount: data.postCount,
			user: data.user,
			group,
		});

		return task.save();
	}

	/**
	 * @description Возвращает список задач
	 * @property {UserDocument} user
	 * @return {Promise.<Array.<CheckWallBanTaskDocument>>}
	 */
	// eslint-disable-next-line class-methods-use-this
	async list(user) {
		const CheckWallBanTask = mongoose.model('CheckWallBanTask');
		return CheckWallBanTask.find({ user })
			.populate('group')
			.lean()
			.exec();
	}

	/**
	 * @param {String} _id
	 * @param {UserDocument} user
	 * @return {Promise<void>}
	 */
	// eslint-disable-next-line class-methods-use-this
	async resume(_id, user) {
		const CheckWallBanTask = mongoose.model('CheckWallBanTask');
		const Task = mongoose.model('Task');
		const task = await CheckWallBanTask.findOne({ _id, user })
			.populate('group')
			.exec();

		if (!task) {
			throw new NotFound({
				what: 'WallSeekTask',
				query: { _id },
			});
		}

		task.status = Task.status.waiting;
		return task.save();
	}
}

export default WallSeekApi;
