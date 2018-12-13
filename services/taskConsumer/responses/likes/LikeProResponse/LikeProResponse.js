import puppeteer from 'puppeteer';

import Response from '../../../../../lib/amqp/Response';
import loginAction from './login';

class LikeProResponse extends Response {
	/**
	 * @return {String}
	 */
	// eslint-disable-next-line class-methods-use-this,
	get method() {
		return 'setLikes_likePro';
	}

	//eslint-disable-next-line object-curly-newline
	async process({ postLink, count, serviceCredentials: { login, password } }) {
		const browser = await puppeteer.launch({
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
			handleSIGINT: false,
			headless: process.env.NODE_ENV === 'production',
		});
		let result;
		try {
			this.logger.info({
				mark: 'likes',
				service: 'likePro',
				message: 'Логинимся',
				postLink,
				count,
				login,
				password,
			});
			const page = await browser.newPage();
			await loginAction(page, {
				login,
				password,
			});
			await page.goto('https://likepro.org/cabinet', { waitUntil: 'networkidle2' });

			// Ставим лайки
			const urlInput = await page.$('.widget__addtask form input[name="url"]');
			await urlInput.type(postLink);

			const likesCountInput = await page.$('.widget__addtask form input[name="like_count"]');
			await likesCountInput.type(`${count}`);

			await page.click('button.ant-btn.ant-btn-primary.ant-btn-lg');
			await page.waitForSelector('.ant-message .ant-message-notice-content');

			result = await page.evaluate(() => {
				const _result = {};
				const error = document.querySelector(
					'.ant-message .ant-message-custom-content.ant-message-error span',
				);
				const success = document.querySelector(
					'.ant-message .ant-message-custom-content.ant-message-success span',
				);

				if (error) {
					_result.error = error.innerText;
				} else {
					_result.success = success.innerText;
				}
				return _result;
			});
		} finally {
			await browser.close();
		}

		this.logger.info({
			mark: 'likes',
			service: 'likePro',
			message: 'Выполнилась',
			postLink,
			count,
			login,
			password,
			result,
		});

		if (result.error) {
			throw new Error(result.error);
		}

		return result;
	}
}

export default LikeProResponse;
