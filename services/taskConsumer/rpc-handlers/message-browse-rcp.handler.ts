import { inject, injectable } from 'inversify';
import { VkAuthorizer } from '../actions/vk/vk-authorizer';
import { AbstractRpcHandler } from '../../../lib/amqp/abstract-rpc-handler';
import { VkUserCredentialsInterface } from '../../api/vk-users/vk-user-credentials.interface';
import { Browser } from 'puppeteer';
import { createBrowserPage } from '../actions/create-page';
import { LoggerInterface } from '../../../lib/logger.interface';
import { MessageReader } from '../actions/vk/message-reader';

type ReedFeedArgument = {
	userCredentials: VkUserCredentialsInterface;
};

@injectable()
export class MessageBrowseRcpHandler extends AbstractRpcHandler {
	protected method = 'reed_messages';

	@inject(VkAuthorizer) private readonly vkAuthorizer: VkAuthorizer;

	@inject(MessageReader) private readonly messageReader: MessageReader;

	@inject('Logger') private readonly logger: LoggerInterface;

	async handle(args: ReedFeedArgument): Promise<object> {
		const { userCredentials } = args;
		this.logger.info({
			message: 'Задача на фейковую активность | чтение сообщений',
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

			await this.messageReader.readMessages(page);
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
