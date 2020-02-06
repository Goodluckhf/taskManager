import { inject, injectable } from 'inversify';
import { Browser } from 'puppeteer';
import { AbstractRpcHandler } from '../../../lib/amqp/abstract-rpc-handler';
import { VkUserCredentialsInterface } from '../../api/vk-users/vk-user-credentials.interface';
import { VkAuthorizer } from '../actions/vk/vk-authorizer';
import { LoggerInterface } from '../../../lib/logger.interface';
import { createBrowserPage } from '../actions/create-page';
import { getRandom } from '../../../lib/helper';
import { FeedBrowser } from '../actions/vk/feed-browser';
import { MessageReader } from '../actions/vk/message-reader';
import { GroupBrowser } from '../actions/vk/group-browser';

@injectable()
export class FakeActivityRpcHandler extends AbstractRpcHandler {
	protected method = 'fake_activity';

	@inject(VkAuthorizer) private readonly vkAuthorizer: VkAuthorizer;

	@inject(FeedBrowser) private readonly feedBrowser: FeedBrowser;

	@inject(GroupBrowser) private readonly groupBrowser: GroupBrowser;

	@inject(MessageReader) private readonly messageReader: MessageReader;

	@inject('Logger') private readonly logger: LoggerInterface;

	async handle({
		userCredentials,
	}: {
		userCredentials: VkUserCredentialsInterface;
	}): Promise<object> {
		this.logger.info({
			message: 'Задача на фейковую активность',
			credentials: userCredentials,
		});

		let browser: Browser = null;
		const canRetry = true;
		try {
			const { page, browser: _browser } = await createBrowserPage(userCredentials.proxy);
			browser = _browser;

			await this.vkAuthorizer.authorize(page, {
				login: userCredentials.login,
				password: userCredentials.password,
				proxy: userCredentials.proxy,
				remixsid: userCredentials.remixsid,
			});

			const randomNumber = getRandom(0, 100);
			if (randomNumber < 30) {
				this.logger.info({ message: 'Листаем ленту', login: userCredentials.login });
				await this.feedBrowser.browse(page);
				return {};
			}

			if (randomNumber < 60) {
				this.logger.info({ message: 'Читаем сообщения', login: userCredentials.login });
				await this.messageReader.readMessages(page);
				return {};
			}

			this.logger.info({ message: 'лазием по своим группам', login: userCredentials.login });
			await this.groupBrowser.browse(page);

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
