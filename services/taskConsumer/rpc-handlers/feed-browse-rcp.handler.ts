import { inject, injectable } from 'inversify';
import { VkAuthorizer } from '../actions/vk/vk-authorizer';
import { FeedBrowser } from '../actions/vk/feed-browser';
import { AbstractRpcHandler } from '../../../lib/amqp/abstract-rpc-handler';
import { VkUserCredentialsInterface } from '../../api/vk-users/vk-user-credentials.interface';
import { Browser } from 'puppeteer';
import { createBrowserPage } from '../actions/create-page';
import { LoggerInterface } from '../../../lib/logger.interface';

type ReedFeedArgument = {
	userCredentials: VkUserCredentialsInterface;
	isSmart: boolean;
	commonFeed: boolean;
	recommend: boolean;
	scrollCount: number;
};

@injectable()
export class FeedBrowseRcpHandler extends AbstractRpcHandler {
	protected readonly method = 'reed_feed';

	static readonly method = 'reed_feed';

	@inject(VkAuthorizer) private readonly vkAuthorizer: VkAuthorizer;

	@inject(FeedBrowser) private readonly feedBrowser: FeedBrowser;

	@inject('Logger') private readonly logger: LoggerInterface;

	async handle(args: ReedFeedArgument): Promise<object> {
		const { userCredentials, ...feedOptions } = args;
		this.logger.info({
			message: 'Задача на фейковую активность | чтение ленты',
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

			await this.feedBrowser.browse(page, feedOptions);
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
