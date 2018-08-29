import mongoose from 'mongoose';

import BaseApi               from './BaseApi';
import { GroupAlreadyExist } from './errors';

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
				isTarget: { type: 'string' },
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
	 * @description Возвращает список групп
	 * @return {Promise.<Array.<GroupDocument>>}
	 */
	//eslint-disable-next-line class-methods-use-this
	async list() {
		const Group  = mongoose.model('Group');
		return Group.find().sort({ isTarget: -1 }).exec();
	}
}

export default GroupApi;
