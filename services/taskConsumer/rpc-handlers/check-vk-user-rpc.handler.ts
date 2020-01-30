import { inject } from 'inversify';
import { AbstractRpcHandler } from '../../../lib/amqp/abstract-rpc-handler';
import { LoggerInterface } from '../../../lib/logger.interface';
import { VkAuthorizer } from '../actions/vk/vk-authorizer';
import { createBrowserPage } from '../actions/create-page';

export class CheckVkUserRpcHandler extends AbstractRpcHandler {
	@inject('Logger') private readonly logger: LoggerInterface;

	@inject(VkAuthorizer) private readonly vkAuthorizer: VkAuthorizer;

	protected method = 'checkVkUser';

	async handle({ userCredentials: { login, password, proxy } }) {
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
				await this.vkAuthorizer.authorize(page, {
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
