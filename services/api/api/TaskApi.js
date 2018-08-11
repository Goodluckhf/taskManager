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
			const validationError = new ValidationError(data);
			validationError.error = error;
			throw validationError;
		}
	}
}

export default TaskApi;
