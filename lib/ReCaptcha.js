import bluebird from 'bluebird';

const baseUrl = 'http://rucaptcha.com';

/**
 * @property {AxiosInstance} axios
 * @property {String} token
 */
class ReCaptcha {
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
			key: this.token,
			json: 1,
		};

		const params = method.toLowerCase() === 'get' ? { params: mergedData } : mergedData;
		const { data: response } = await this.axios[method](url, params, { timeout: 7000 });

		if (response.status !== 1) {
			const error = new Error(response.request);
			error.status = response.status;
			throw error;
		}

		return response;
	}

	/**
	 * @param {String} id
	 * @private
	 * @return {Promise.<{status, response}>}
	 */
	getResponse(id) {
		return this.sendRequest({
			url: `${baseUrl}/res.php`,
			method: 'get',
			data: {
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
				await bluebird.delay(4000);
				return this.getResponseWithLoop(id);
			}

			throw error;
		}
	}

	async loopSolve({ siteKey, pageUrl }) {
		const { request: id } = await this.sendRequest({
			url: `${baseUrl}/in.php`,
			method: 'post',
			data: {
				googlekey: siteKey,
				pageurl: pageUrl,
				method: 'userrecaptcha',
			},
		});

		await bluebird.delay(6000);
		try {
			return await this.getResponseWithLoop(id);
		} catch (error) {
			if (error.status === 0 && error.message === 'ERROR_CAPTCHA_UNSOLVABLE') {
				return this.loopSolve({ siteKey, pageUrl });
			}

			throw error;
		}
	}

	async solve({ pageUrl, siteKey }) {
		return this.loopSolve({ pageUrl, siteKey });
	}
}

export default ReCaptcha;
