import puppeteer from 'puppeteer';
import Response from '../../../../lib/amqp/Response';
import loginAction from '../../actions/smmBro/login';
import createTask from '../../actions/smmBro/createTask';

class SmmBroResponse extends Response {
	/**
	 * @return {String}
	 */
	// eslint-disable-next-line class-methods-use-this,
	get method() {
		return 'setLikes_smmBro';
	}

	async process({ postLink, likesCount, serviceCredentials: { login, password } }) {
		const browser = await puppeteer.launch({
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
			handleSIGINT: false,
			headless: process.env.NODE_ENV === 'production',
		});

		try {
			const page = await browser.newPage();
			await loginAction(page, { login, password });

			const errors = await createTask(page, { postLink, count: likesCount, type: 'likes' });

			if (errors.length) {
				const error = new Error('Ошибки валидации');
				error.messages = errors;
				error.statusCode = 1;
				throw error;
			}

			this.logger.info({
				mark: 'likes',
				service: 'smmBro',
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

export default SmmBroResponse;
