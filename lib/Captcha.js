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
	 * @private
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
	 * @private
	 * @return {String}
	 */
	async loadImageBase64(imageUrl) {
		const { data: image } = await this.axios.get(imageUrl, {
			responseType: 'arraybuffer',
		});
		
		return Buffer.from(image, 'binary').toString('base64');
	}
	
	/**
	 * @param {String} imageBase64
	 * @private
	 * @return {Promise.<String>}
	 */
	async sendCaptcha(imageBase64) {
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
	 * @private
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
	 * @private
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
	 * @param {String} captchaImageBase64
	 * @private
	 * @return {Promise<String>}
	 */
	async loopSolve(captchaImageBase64) {
		const id = await this.sendCaptcha(captchaImageBase64);
		await bluebird.delay(3000);
		try {
			return await this.getResponseWithLoop(id);
		} catch (error) {
			if (error.status === 0 && error.message === 'ERROR_CAPTCHA_UNSOLVABLE') {
				return this.loopSolve(captchaImageBase64);
			}
			
			throw error;
		}
	}
	
	/**
	 * @param {String} captchaUrl
	 * @return {Promise<String>}
	 */
	async solve(captchaUrl) {
		const imageBase64 = await this.loadImageBase64(captchaUrl);
		return this.loopSolve(imageBase64);
	}
}

export default Captcha;
