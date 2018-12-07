import mongoose from '../../../lib/mongoose';
import BaseApi from './BaseApi';
import { GroupAlreadyExist, NotFound } from './errors';
import { groupForVkApiByHref } from '../../../lib/helper';

/**
 * @property {VkApi} vkApi
 */
class GroupApi extends BaseApi {
	constructor(vkApi, ...args) {
		super(...args);
		this.vkApi = vkApi;
	}

	/**
	 * @description Добавляет новую группу
	 * @param {Object} data
	 * @param {String} data.link
	 * @param {String} data.isTarget
	 * @param {UserDocument} data.user
	 */
	async add(data) {
		const Group = mongoose.model('Group');

		this.validate(
			{
				properties: {
					link: { type: 'string' },
					admin: { type: 'string' },
					isTarget: { oneOf: [{ type: 'string' }, { type: 'boolean' }] },
				},
				required: ['link'],
			},
			data,
		);

		const vkGroup = await this.vkApi.groupByHref(data.link);
		const group = await Group.findOne({ publicId: vkGroup.id });
		if (group) {
			throw new GroupAlreadyExist({ id: vkGroup.id, name: vkGroup.name });
		}

		const newGroup = Group.createInstance(vkGroup);
		await newGroup.save();
		const groupObject = newGroup.toObject({ getters: true });
		if (data.isTarget) {
			data.user.targetGroups.push(newGroup);
			await data.user.save();
			groupObject.isTarget = true;
		} else {
			groupObject.isTarget = false;
		}

		return groupObject;
	}

	/**
	 * @param {String} _id
	 * @param {boolean} isTarget
	 * @param {UserDocument} user
	 * @return {Promise<void>}
	 */
	//eslint-disable-next-line class-methods-use-this
	async changeIsTarget(_id, isTarget, user) {
		const Group = mongoose.model('Group');

		const group = await Group.findOne({ _id });
		if (!group) {
			throw new NotFound({ query: { _id }, what: 'Group' });
		}

		const targetGroupIndex = user.targetGroups.findIndex(id => id.toString() === _id);
		if (targetGroupIndex === -1) {
			user.targetGroups.push(group);
		} else {
			user.targetGroups.splice(targetGroupIndex, 1);
		}

		await user.save();
	}

	/**
	 * @description Возвращает список групп
	 * @param {String} search
	 * @param {boolean} isTarget
	 * @param {UserDocument} user
	 * @return {Promise.<Array.<GroupDocument>>}
	 */
	//eslint-disable-next-line class-methods-use-this
	async list({ search, isTarget: _isTarget, user }) {
		const Group = mongoose.model('Group');
		const isTarget = _isTarget === 'true' || _isTarget === true;

		const query = {};
		if (search) {
			const $or = [{ name: RegExp(search, 'i') }];
			const group = groupForVkApiByHref(search, false);

			if (group.owner_id) {
				$or.push({ publicId: RegExp(group.owner_id, 'i') });
			} else {
				$or.push({ domain: RegExp(group.domain, 'i') });
			}
			query.$or = $or;
		}

		if (isTarget) {
			query._id = { $in: user.targetGroups };
		}

		const idsHash = user.targetGroups.reduce(
			(obj, id) => ({
				...obj,
				[id.toString()]: true,
			}),
			{},
		);

		const groups = await Group.find(query)
			.sort({ name: -1 })
			.lean()
			.exec();
		return groups.map(group => {
			//eslint-disable-next-line no-param-reassign
			group.isTarget = !!idsHash[group._id];
			return group;
		});
	}
}

export default GroupApi;
