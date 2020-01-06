import bluebird from 'bluebird';
import { inject, injectable } from 'inversify';
import { AxiosInstance } from 'axios';
import { ConfigInterface } from '../config/config.interface';
import { ReCaptchaService } from './re-captcha.service';

const baseUrl = 'http://rucaptcha.com';

@injectable()
export class CaptchaService {
	private readonly token: string;

	constructor(
		@inject('Axios') private readonly axios: AxiosInstance,
		@inject('Config') private readonly config: ConfigInterface,
		@inject(ReCaptchaService) private readonly reCaptchaService: ReCaptchaService,
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

	private async loadImageBase64(imageUrl: string): Promise<string> {
		const { data: image } = await this.axios.get(imageUrl, {
			responseType: 'arraybuffer',
			timeout: 10000,
		});

		return Buffer.from(image, 'binary').toString('base64');
	}

	private async sendCaptcha(imageBase64: string): Promise<string> {
		const { request } = await this.sendRequest({
			url: `${baseUrl}/in.php`,
			method: 'post',
			data: {
				body: imageBase64,
				method: 'base64',
			},
		});

		return request;
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
				await bluebird.delay(3000);
				return this.getResponseWithLoop(id);
			}

			throw error;
		}
	}

	private async loopSolve(captchaImageBase64: string): Promise<string> {
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

	async solve(captchaUrl: string): Promise<string> {
		const imageBase64 = await this.loadImageBase64(captchaUrl);
		return this.loopSolve(imageBase64);
	}

	async solveRecaptchaV2({
		pageUrl,
		siteKey,
	}: {
		pageUrl: string;
		siteKey: string;
	}): Promise<string> {
		return this.reCaptchaService.solve({ pageUrl, siteKey });
	}
}
