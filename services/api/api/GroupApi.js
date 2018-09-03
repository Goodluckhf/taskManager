import mongoose from 'mongoose';

import BaseApi                         from './BaseApi';
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
	 */
	async add(data) {
		const Group = mongoose.model('Group');
		
		this.validate({
			properties: {
				link    : { type: 'string' },
				admin   : { type: 'string' },
				isTarget: { oneOf: [{ type: 'string' }, { type: 'boolean' }] },
			},
			required: ['link'],
		}, data);
		
		const vkGroup = await this.vkApi.groupByHref(data.link);
		const group   = await Group.findOne({ publicId: vkGroup.id });
		if (group) {
			throw new GroupAlreadyExist({ id: vkGroup.id, name: vkGroup.name });
		}
		
		const newGroup = Group.createInstance(vkGroup);
		
		if (data.isTarget) {
			newGroup.isTarget = data.isTarget;
		}
		
		return newGroup.save();
	}
	
	/**
	 * @param {String} _id
	 * @param {boolean} isTarget
	 * @return {Promise<void>}
	 */
	//eslint-disable-next-line class-methods-use-this
	async changeIsTarget(_id, isTarget) {
		const Group = mongoose.model('Group');
		const group = await Group.findOne({ _id });
		if (!group) {
			throw new NotFound({ query: { _id }, what: 'Group' });
		}
		group.isTarget = Boolean(isTarget);
		return group.save();
	}
	
	/**
	 * @description Возвращает список групп
	 * @property {String} search
	 * @property {boolean} isTarget
	 * @return {Promise.<Array.<GroupDocument>>}
	 */
	//eslint-disable-next-line class-methods-use-this
	async list({ search, isTarget: _isTarget }) {
		const Group  = mongoose.model('Group');
		const isTarget = _isTarget === 'true' || _isTarget === true;
		
		
		const query = {};
		if (search) {
			const $or   = [{ name: RegExp(search, 'i') }];
			const group = groupForVkApiByHref(search, false);
			
			if (group.owner_id) {
				$or.push({ publicId: RegExp(group.owner_id, 'i') });
			} else {
				$or.push({ domain: RegExp(group.domain, 'i') });
			}
			query.$or = $or;
		}
		
		if (isTarget) {
			query.isTarget = true;
		}
		
		return Group.find(query).sort({ isTarget: -1 }).exec();
	}
}

export default GroupApi;
