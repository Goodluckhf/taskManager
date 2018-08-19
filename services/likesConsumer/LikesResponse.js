import Response from '../../lib/amqp/Response';

/**
 * @property {Puppeteer.Browser} browser
 */
class LikesResponse extends Response {
	constructor(browser, ...args) {
		super(...args);
		this.browser = browser;
	}
	
	//eslint-disable-next-line
	async process(method, data) {
		const page = await this.browser.newPage();
		await page.goto('https://likepro.org/cabinet', { waitUntil: 'networkidle2' });
	}
}

export default LikesResponse;
