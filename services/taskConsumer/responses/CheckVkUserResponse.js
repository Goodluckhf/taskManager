import Response from '../../../lib/amqp/Response';
import { createBrowserPage } from '../actions/createPage';
import { authorize } from '../actions/vk/authorize';

class CheckVkUserResponse extends Response {
	/**
	 * @return {String}
	 */
	// eslint-disable-next-line class-methods-use-this,
	get method() {
		return 'checkVkUser';
	}

	async process({ login, password, proxy }) {
		this.logger.info({
			message: 'Задача на проверку пользователя vk',
			credentials: { login, password },
			proxy,
		});

		const canRetry = true;
		/**
		 * @type {Browser}
		 */
		let browser = null;
		try {
			const { page, browser: _browser } = await createBrowserPage(proxy);
			browser = _browser;
			try {
				await authorize(page, this.logger, {
					login,
					password,
					proxy,
				});
				return { isActive: true };
			} catch (error) {
				if (error.code === 'login_failed' || error.code === 'blocked') {
					return { isActive: false, code: error.code };
				}

				throw error;
			}
		} catch (error) {
			error.canRetry = typeof error.canRetry !== 'undefined' ? error.canRetry : canRetry;
			throw error;
		} finally {
			if (browser) {
				await browser.close();
			}
		}
	}
}

export default CheckVkUserResponse;
