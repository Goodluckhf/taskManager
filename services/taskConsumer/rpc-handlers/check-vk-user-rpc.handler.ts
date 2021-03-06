import { inject } from 'inversify';
import { AbstractRpcHandler } from '../../../lib/amqp/abstract-rpc-handler';
import { LoggerInterface } from '../../../lib/logger.interface';
import { VkAuthorizer } from '../actions/vk/vk-authorizer';
import { createBrowserPage } from '../actions/create-page';
import { VkUserCredentialsInterface } from '../../api/vk-users/vk-user-credentials.interface';

type CheckVkUser = {
	userCredentials: VkUserCredentialsInterface;
};

export class CheckVkUserRpcHandler extends AbstractRpcHandler {
	@inject('Logger') private readonly logger: LoggerInterface;

	@inject(VkAuthorizer) private readonly vkAuthorizer: VkAuthorizer;

	protected readonly method = 'checkVkUser';

	static readonly method = 'checkVkUser';

	async handle({
		userCredentials: { login, password, proxy, remixsid: lastRemixsid, userAgent },
	}: CheckVkUser) {
		this.logger.info({
			message: 'Задача на проверку пользователя vk',
			credentials: { login, password, remixsid: lastRemixsid, userAgent },
			proxy,
		});

		const canRetry = true;
		/**
		 * @type {Browser}
		 */
		let browser = null;
		try {
			const { page, browser: _browser, userAgent: newUserAgent } = await createBrowserPage(
				proxy,
				userAgent,
			);
			browser = _browser;
			try {
				const { remixsid } = await this.vkAuthorizer.authorize(page, {
					login,
					password,
					proxy,
					remixsid: lastRemixsid,
				});
				return { isActive: true, remixsid, userAgent: newUserAgent };
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
