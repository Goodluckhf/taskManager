import puppeteer from 'puppeteer';

import Response    from '../../../../lib/amqp/Response';
import loginAction from '../../actions/likest/login';

class LikestResponse extends Response {
	//eslint-disable-next-line object-curly-newline
	constructor({ captcha, ...args }) {
		super(args);
		this.captcha  = captcha;
	}
	
	/**
	 * @return {String}
	 */
	// eslint-disable-next-line class-methods-use-this,
	get method() {
		return 'setComments_likest';
	}
	
	async process({ postLink, commentsCount, serviceCredentials: { login, password } }) {
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
			
			await page.goto('https://likest.ru/comments/add', { waitUntil: 'networkidle2' });
			
			await page.evaluate((_postLink) => {
				document.querySelector('#edit-link').value = _postLink;
			}, postLink);
			
			await page.click('#edit-form1-continue');
			await page.waitForFunction(() => {
				return !!document.querySelector('#hpoints-comments-add-form--2');
			});
			
			// Ставим галки на все типы комментов
			await page.evaluate(() => {
				document.querySelectorAll('#moods input[type="checkbox"]').forEach((checkbox) => {
					//eslint-disable-next-line no-param-reassign
					checkbox.checked = true;
				});
			});
			
			// Дожидаемся загрузки вариантов коментов
			await page.click('#edit-moods-fieldset-actions-wrapper-actions-load-templates');
			await page.waitForFunction(() => {
				return document.querySelectorAll('#comments-fieldset-wrapper textarea').length > 1;
			});
			
			await page.click('#edit-actions-form2-continue');
			await page.waitForFunction(() => {
				return !!document.querySelector('#hpoints-comments-add-form--3');
			});
			
			await page.evaluate((_postLink, _commentsCount) => {
				document.querySelector('#edit-title').value = _postLink;
				document.querySelector('#amount').value     = _commentsCount;
			}, postLink, commentsCount);
			
			// Нажимаем выполнить и ожидаем ошибки или успешное завершение
			this.logger.info({
				message: 'кликаем накрутить',
				postLink,
				commentsCount,
				login,
			});
			await page.click('#edit-form3-continue');
			
			await page.waitForFunction(() => {
				const errors = document.querySelectorAll('#hpoints-comments-add-form--3 .messages.error');
				if (errors.length) {
					return true;
				}
				
				return !!document.querySelector('#edit-done-message');
			});
			
			const errors = await page.evaluate(() => {
				const errorsElements = [...document.querySelectorAll('#hpoints-comments-add-form--3 .messages.error')];
				return errorsElements.map(element => element.innerText);
			});
			
			if (errors.length) {
				const error      = new Error('Ошибки валидации');
				error.messages   = errors;
				error.statusCode = 1;
				throw error;
			}
			this.logger.info({
				message: 'воркер комментов likest',
				postLink,
				commentsCount,
				login,
			});
		} finally {
			await browser.close();
		}
	}
}

export default LikestResponse;
