import bluebird from 'bluebird';
import { inject, injectable } from 'inversify';
import { AxiosInstance } from 'axios';
import { ConfigInterface } from '../config/config.interface';

const baseUrl = 'http://rucaptcha.com';

@injectable()
export class ReCaptchaService {
	private readonly token: string;

	constructor(
		@inject('Axios') private readonly axios: AxiosInstance,
		@inject('Config') private readonly config: ConfigInterface,
	) {
		this.axios = axios;
		this.token = this.config.get('rucaptcha.token');
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
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			error.status = response.status;
			throw error;
		}

		return response;
	}

	private getResponse(id: string) {
		return this.sendRequest({
			url: `${baseUrl}/res.php`,
			method: 'get',
			data: {
				action: 'get',
				id,
			},
		});
	}

	private async getResponseWithLoop(id: string): Promise<string> {
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

	async loopSolve({ siteKey, pageUrl }): Promise<string> {
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

	async solve({ pageUrl, siteKey }: { pageUrl: string; siteKey: string }): Promise<string> {
		return this.loopSolve({ pageUrl, siteKey });
	}
}
