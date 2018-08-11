import axios from 'axios';

const vkApiUrl = 'https://api.vk.com/method';

class VkApi {
	constructor(token) {
		this.token = token;
	}
	
	/**
	 * @param {String} method
	 * @param {Object} data
	 * @return {Promise<*>}
	 */
	apiRequest(method, data) {
		return axios({
			url   : `${vkApiUrl}/${method}`,
			method: 'POST',
			data  : {
				access_token: this.token,
				...data,
			},
		});
	}
}

export default VkApi;
