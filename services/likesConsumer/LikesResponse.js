import puppeteer from 'puppeteer';

import Response    from '../../lib/amqp/Response';
import loginAction from './login';

/**
 * @property {String} login
 * @property {String} password
 */
class LikesResponse extends Response {
	constructor({ login, password, ...args }) {
		super(args);
		this.login    = login;
		this.password = password;
	}
	
	//eslint-disable-next-line
	async process(method, { postLink, likesCount }) {
		const browser = await puppeteer.launch({
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
			],
			headless: process.env.NODE_ENV === 'production',
		});
		const page    = await browser.newPage();
		await loginAction(page, {
			login   : this.login,
			password: this.password,
		});
		await page.goto('https://likepro.org/cabinet', { waitUntil: 'networkidle2' });
		this.logger.info({ postLink, likesCount });
		
		// Ставим лайки
		const urlInput = await page.$('.widget__addtask form input[name="url"]');
		await urlInput.type(postLink);
		
		const likesCountInput = await page.$('.widget__addtask form input[name="like_count"]');
		await likesCountInput.type(`${likesCount}`);
		
		await page.click('button.ant-btn.ant-btn-primary.ant-btn-lg');
		await page.waitForSelector('.ant-message .ant-message-notice-content');
		
		const result = await page.evaluate(() => {
			const _result = {};
			const error   = document.querySelector('.ant-message .ant-message-custom-content.ant-message-error span');
			const success = document.querySelector('.ant-message .ant-message-custom-content.ant-message-success span');
			
			if (error) {
				_result.error = error.innerText;
			} else {
				_result.success = success.innerText;
			}
			return _result;
		});
		
		await browser.close();
		
		return result;
	}
}

export default LikesResponse;
