import puppeteer from 'puppeteer';
import Response from '../../../../lib/amqp/Response';
import loginAction from '../../actions/likest/login';

/**
 * @property {Captcha} captcha
 */
class LikestResponse extends Response {
	constructor({ captcha, ...args }) {
		super(args);
		this.captcha = captcha;
	}

	/**
	 * @return {String}
	 */
	// eslint-disable-next-line class-methods-use-this,
	get method() {
		return 'setReposts_likest';
	}

	async login(page, { login, password }) {
		try {
			await loginAction(page, this.captcha, { login, password });
		} catch (error) {
			await this.login(page, { login, password });
		}
	}

	async process({ postLink, repostsCount, serviceCredentials: { login, password } }) {
		const browser = await puppeteer.launch({
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
			handleSIGINT: false,
			headless: process.env.NODE_ENV === 'production',
		});

		try {
			const page = await browser.newPage();
			// Авторизовываемся
			await this.login(page, { login, password });
			this.logger.info({
				message: 'залогинились likest',
				postLink,
				repostsCount,
				login,
			});

			//Заполняем поля для накрутки лайков
			await page.goto('https://likest.ru/reposts/add', { waitUntil: 'networkidle2' });

			await page.evaluate(
				(_postLink, _repostsCount) => {
					document.querySelector('#edit-title').value = _postLink;
					document.querySelector('#edit-link').value = _postLink;
					document.querySelector('#amount').value = _repostsCount;
				},
				postLink,
				repostsCount,
			);

			// Нажимаем выполнить и ожидаем ошибки или успешное завершение
			this.logger.info({
				mark: 'reposts',
				service: 'likest',
				message: 'кликаем накрутить',
				postLink,
				repostsCount,
				login,
			});
			await page.click('#edit-submit');
			await page.waitForFunction(() => {
				const errors = document.querySelectorAll(
					'#hpoints-reposts-add-form .messages.error',
				);
				if (errors.length) {
					return true;
				}

				return !!document.querySelector('#reposts-add-ajax-form-wrapper .messages.status');
			});

			const errors = await page.evaluate(() => {
				const errorsElements = [
					...document.querySelectorAll('#hpoints-reposts-add-form .messages.error'),
				];
				return errorsElements.map(element => element.innerText);
			});

			if (errors.length) {
				const error = new Error('Ошибки валидации');
				error.messages = errors;
				error.statusCode = 1;
				throw error;
			}

			this.logger.info({
				mark: 'reposts',
				service: 'likest',
				message: 'Задача выполнилась',
				postLink,
				repostsCount,
				login,
			});
		} finally {
			await browser.close();
		}
	}
}

export default LikestResponse;
