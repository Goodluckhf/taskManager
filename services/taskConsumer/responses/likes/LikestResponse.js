import puppeteer   from 'puppeteer';
import Response    from '../../../../lib/amqp/Response';
import loginAction from '../../actions/likest/login';

/**
 * @property {Captcha} captcha
 */
class LikestResponse extends Response {
	//eslint-disable-next-line object-curly-newline
	constructor({ captcha, ...args }) {
		super(args);
		this.captcha = captcha;
	}
	
	/**
	 * @return {String}
	 */
	// eslint-disable-next-line class-methods-use-this,
	get method() {
		return 'setLikes_likest';
	}
	
	async process({ postLink, likesCount, serviceCredentials: { login, password } }) {
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
			await loginAction(page, this.captcha, login, password);
			this.logger.info({
				message: 'залогинились likest',
				postLink,
				likesCount,
				login,
			});
			//Заполняем поля для накрутки лайков
			await page.goto('https://likest.ru/buy-likes', { waitUntil: 'networkidle2' });
			await page.evaluate((link, count) => {
				document.querySelector('#edit-title').value = link;
				document.querySelector('#edit-link').value  = link;
				document.querySelector('#amount').value     = count;
			}, postLink, likesCount);
			
			this.logger.info({
				mark   : 'likes',
				service: 'likest',
				message: 'кликаем накрутить',
				postLink,
				likesCount,
				login,
			});
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
				const error      = new Error('Ошибки валидации');
				error.messages   = errors;
				error.statusCode = 1;
				throw error;
			}
			
			this.logger.info({
				mark   : 'likes',
				service: 'likest',
				message: 'Задача выполнилась',
				postLink,
				likesCount,
				login,
			});
		} finally {
			await browser.close();
		}
	}
}

export default LikestResponse;
