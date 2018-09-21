import bluebird from 'bluebird';

const baseUrl = 'http://rucaptcha.com';

/**
 * @property {AxiosInstance} axios
 * @property {String} token
 */
class Captcha {
	constructor(axios, token) {
		this.axios = axios;
		this.token = token;
	}
	
	/**
	 * @param {Object.<*>} data
	 * @param {String} method
	 * @param {String} url
	 * @return {Promise<void>}
	 */
	async sendRequest({ data, method, url }) {
		const mergedData = {
			...data,
			key : this.token,
			json: 1,
		};
		
		const params = method.toLowerCase() === 'get' ? { params: mergedData } : mergedData;
		const { data: response } = await this.axios[method](url, params);
		
		if (response.status !== 1) {
			const error = new Error(response.request);
			error.status = response.status;
			throw error;
		}
		
		return response;
	}
	
	/**
	 * @param {String} imageUrl
	 * @return {Promise.<String>}
	 */
	async sendCaptcha(imageUrl) {
		const { data: image } = await this.axios.get(imageUrl, {
			responseType: 'arraybuffer',
		});
		
		const imageBase64 = Buffer.from(image, 'binary').toString('base64');
		
		const { request } = await this.sendRequest({
			url   : `${baseUrl}/in.php`,
			method: 'post',
			data  : {
				body  : imageBase64,
				method: 'base64',
			},
		});
		
		return request;
	}
	
	/**
	 * @param {String} id
	 * @return {Promise.<{status, response}>}
	 */
	getResponse(id) {
		return this.sendRequest({
			url   : `${baseUrl}/res.php`,
			method: 'get',
			data  : {
				action: 'get',
				id,
			},
		});
	}
	
	/**
	 * @param {String} id
	 * @return {Promise.<String>}
	 */
	async getResponseWithLoop(id) {
		try {
			const { request } = await this.getResponse(id);
			return request;
		} catch (error) {
			if (error.status === 0 && error.message === 'CAPCHA_NOT_READY') {
				await bluebird.delay(3000);
				return this.getResponseWithLoop(id);
			}
			
			throw error;
		}
	}
	
	/**
	 * @param {String} captchaUrl
	 * @return {Promise<String>}
	 */
	async solve(captchaUrl) {
		const id = await this.sendCaptcha(captchaUrl);
		await bluebird.delay(3000);
		try {
			return this.getResponseWithLoop(id);
		} catch (error) {
			if (error.status === 0 && error.message === 'ERROR_CAPTCHA_UNSOLVABLE') {
				return this.solve(captchaUrl);
			}
			
			throw error;
		}
	}
}

export default Captcha;
