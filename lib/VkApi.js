import axios                   from 'axios';
import { groupForVkApiByHref, groupIdForApi } from './helper';
import { VkApiError }          from '../services/api/api/errors';

const axiosInstance = axios.create();

const vkApiUrl = 'https://api.vk.com/method';
const agent    = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:47.0) Gecko/20100101 Firefox/47.0';

// @TODO: Сделать обработку ошибки слишком частых запросов
class VkApi {
	/**
	 * @param {String} token
	 * @param {Object} config
	 * @param {Number} config.version
	 * @param {Number} config.timeout
	 */
	constructor(token, { version = 5.80, timeout = 5000 } = {}) {
		this.token   = token;
		this.version = version;
		this.timeout = timeout;
	}
	
	/**
	 * @param {String} method
	 * @param {Object} _data
	 * @return {Promise<*>}
	 * @throws VkApiError
	 */
	async apiRequest(method, _data) {
		const data = {
			v           : this.version,
			access_token: this.token,
			..._data,
		};
		const url = `${vkApiUrl}/${method}`;
		const { data: response, status } = await axiosInstance.request({
			url,
			method : 'post',
			headers: {
				agent,
				'Content-Type': 'application/json',
			},
			timeout: this.timeout,
			params : data,
		});
		
		if (status === 200 && response && response.error) {
			throw new VkApiError(response, { ...data, url });
		}
		
		return response;
	}
	
	/**
	 * @description Возвращает инфу по группе
	 * @param {String} href
	 * @return {Promise<*>}
	 */
	async groupByHref(href) {
		const groupIdObject = groupForVkApiByHref(href, false);
		const groupId  = groupIdObject.owner_id || groupIdObject.domain;
		const { response: [group] } = await this.apiRequest('groups.getById', { group_id: groupId });
		
		// На всякий случай оставлю
		// А вообще vk.com с ошибкой падает, если нет группы
		if (!group) {
			const error   = new Error('Group not found');
			error.groupId = groupId;
			error.href    = href;
			throw error;
		}
		
		return group;
	}
	
	/**
	 * @param {Object} opts
	 * @param {Number} publicId
	 * @param {Number} count
	 * @return {Promise<void>}
	 */
	async getPosts({ publicId, count = 3 }) {
		const { response: { items } } = await this.apiRequest('wall.get', {
			owner_id: groupIdForApi(publicId),
			count,
		});
		
		return items;
	}
}

export default VkApi;
