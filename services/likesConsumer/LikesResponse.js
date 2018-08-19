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
		if (!this.browser) {
			throw new Error('Browser must me injected');
		}
	}
}

export default LikesResponse;
