import puppeteer   from 'puppeteer';
import Response    from '../../../../lib/amqp/Response';
import loginAction from '../../actions/likest/login';

/**
 * @property {String} login
 * @property {String} password
 * @property {Captcha} captcha
 */
class LikestResponse extends Response {
	//eslint-disable-next-line object-curly-newline
	constructor({ login, password, captcha, ...args }) {
		super(args);
		this.login    = login;
		this.password = password;
		this.captcha  = captcha;
	}
	
	/**
	 * @return {String}
	 */
	// eslint-disable-next-line class-methods-use-this,
	get method() {
		return 'setLikes_likest';
	}
	
	async process({ postLink, likesCount }) {
		const browser = await puppeteer.launch({
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
			],
			handleSIGINT: false,
			headless    : process.env.NODE_ENV === 'production',
		});
		
		try {
			const page = await browser.newPage();
			// Авторизовываемся
			await page.goto('https://likest.ru/user', { waitUntil: 'networkidle2' });
			await loginAction(page, this.captcha, this.login, this.password);
			
			//Заполняем поля для накрутки лайков
			await page.goto('https://likest.ru/buy-likes', { waitUntil: 'networkidle2' });
			await page.evaluate((link, count) => {
				document.querySelector('#edit-title').value = link;
				document.querySelector('#edit-link').value  = link;
				document.querySelector('#amount').value     = count;
			}, postLink, likesCount);
			
			await page.click('#edit-submit');
			await page.waitForFunction(() => {
				const errors = document.querySelectorAll('#hpoints-buy-likes-form .messages.error');
				if (errors.length) {
					return true;
				}
				
				const success = document.querySelector('#success-buy-likes');
				return !!success;
			});
			
			const errors = await page.evaluate(() => (
				[...document.querySelectorAll('#hpoints-buy-likes-form .messages.error')].map(element => element.innerText)
			));
			
			if (errors.length) {
				throw errors;
			}
		} finally {
			await browser.close();
		}
	}
}

export default LikestResponse;