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
		return 'setReposts_likest';
	}
	
	async process({ postLink, repostsCount }) {
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
			await page.goto('https://likest.ru/reposts/add', { waitUntil: 'networkidle2' });
			
			await page.evaluate((_postLink, _repostsCount) => {
				document.querySelector('#edit-title').value = _postLink;
				document.querySelector('#edit-link').value  = _postLink;
				document.querySelector('#amount').value     = _repostsCount;
			}, postLink, repostsCount);
			
			// Нажимаем выполнить и ожидаем ошибки или успешное завершение
			await page.click('#edit-submit');
			await page.waitForFunction(() => {
				const errors = document.querySelectorAll('#hpoints-reposts-add-form .messages.error');
				if (errors.length) {
					return true;
				}
				
				return !!document.querySelector('#reposts-add-ajax-form-wrapper .messages status');
			});
			
			const errors = await page.evaluate(() => {
				const errorsElements = [...document.querySelectorAll('#hpoints-reposts-add-form .messages.error')];
				return errorsElements.map(element => element.innerText);
			});
			
			if (errors.length) {
				throw errors;
			}
		} finally {
			// await browser.close();
		}
	}
}

export default LikestResponse;
