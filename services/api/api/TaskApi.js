import { ValidationError } from './errors';
import BaseApi             from './BaseApi';

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
	 * @return {Promise<TaskDocument>}
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
		
		if (data.publicHref) {
			const group = await this.vkApi.groupByHref(data.publicHref);
			this.logger.info({
				group,
			});
			return group;
		}
		return;
	}
}

export default TaskApi;
