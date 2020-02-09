import { inject, injectable } from 'inversify';
import { VkAuthorizer } from '../actions/vk/vk-authorizer';
import { AbstractRpcHandler } from '../../../lib/amqp/abstract-rpc-handler';
import { VkUserCredentialsInterface } from '../../api/vk-users/vk-user-credentials.interface';
import { Browser } from 'puppeteer';
import { createBrowserPage } from '../actions/create-page';
import { LoggerInterface } from '../../../lib/logger.interface';
import { GroupBrowser } from '../actions/vk/group-browser';

type groupBrowseArgument = {
	userCredentials: VkUserCredentialsInterface;
	isPopular: boolean;
	isCommon: boolean;
	shouldChangeCategory: boolean;
	shouldGotoGroup: boolean;
	scrollCount: number;
};

@injectable()
export class GroupBrowseRcpHandler extends AbstractRpcHandler {
	protected method = 'browse_groups';

	@inject(VkAuthorizer) private readonly vkAuthorizer: VkAuthorizer;

	@inject(GroupBrowser) private readonly groupBrowser: GroupBrowser;

	@inject('Logger') private readonly logger: LoggerInterface;

	async handle(args: groupBrowseArgument): Promise<object> {
		const { userCredentials, ...feedOptions } = args;
		this.logger.info({
			message: 'Задача на фейковую активность | просмотр групп',
			taskArgs: args,
		});

		let browser: Browser = null;
		const canRetry = true;
		try {
			const { page, browser: _browser } = await createBrowserPage(
				userCredentials.proxy,
				userCredentials.userAgent,
			);
			browser = _browser;

			await this.vkAuthorizer.authorize(page, {
				login: userCredentials.login,
				password: userCredentials.password,
				proxy: userCredentials.proxy,
				remixsid: userCredentials.remixsid,
			});

			await this.groupBrowser.browse(page, feedOptions);
			return {};
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
