import { inject, injectable } from 'inversify';
import { VkAuthorizer } from '../actions/vk/vk-authorizer';
import { AbstractRpcHandler } from '../../../lib/amqp/abstract-rpc-handler';
import { VkUserCredentialsInterface } from '../../api/vk-users/vk-user-credentials.interface';
import { Browser } from 'puppeteer';
import { createBrowserPage } from '../actions/create-page';
import { LoggerInterface } from '../../../lib/logger.interface';
import { GroupFeedBrowser } from '../actions/vk/group-feed-browser';

type groupBrowseFeedArgument = {
	userCredentials: VkUserCredentialsInterface;
	scrollCount: number;
	groupLink: string;
};

@injectable()
export class GroupFeedBrowseRcpHandler extends AbstractRpcHandler {
	protected readonly method = 'browse_feed_group';

	static readonly method = 'browse_feed_group';

	@inject(VkAuthorizer) private readonly vkAuthorizer: VkAuthorizer;

	@inject(GroupFeedBrowser) private readonly groupFeedBrowser: GroupFeedBrowser;

	@inject('Logger') private readonly logger: LoggerInterface;

	async handle(args: groupBrowseFeedArgument): Promise<object> {
		const { userCredentials, groupLink, ...feedOptions } = args;
		this.logger.info({
			message: 'Задача на фейковую активность | чтение ленты в группе',
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
			await page.goto(groupLink, { waitUntil: 'networkidle2' });
			await this.groupFeedBrowser.browse(page, feedOptions);
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
