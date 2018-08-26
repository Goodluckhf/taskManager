import puppeteer from 'puppeteer';

import Response  from '../../lib/amqp/Response';

class AccountResponse extends Response {
	/**
	 * @param {String} method
	 * @param {String} login
	 * @param {String} password
	 */
	async process(method, { login, password }) {
		const browser = await puppeteer.launch({ headless: false });
		const page    = await browser.newPage();
		
		await page.goto('https://m.vk.com', { waitUntil: 'networkidle2' });
		this.logger.info({
			login,
			password,
		});
		
		const loginInput = await page.$('input[name="email"]');
		await loginInput.type(login);
		
		const passwordInput = await page.$('input[name="pass"]');
		await passwordInput.type(password);
		
		const navigationPromise = page.waitForNavigation();
		await page.click('input[type="submit"]');
		await navigationPromise;
		
		await page.goto('https://vk.com', { waitUntil: 'networkidle2' });
		
		return page.evaluate(() => {
			const $a    = document.querySelector('#side_bar_inner li a');
			const result  = {};
			result.data   = { link: `https://vk.com${$a.attributes.href.value}` };
			
			return result;
		});
	}
}

export default AccountResponse;
