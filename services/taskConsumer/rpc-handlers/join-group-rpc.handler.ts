import { inject, injectable } from 'inversify';
import { Browser } from 'puppeteer';
import { AbstractRpcHandler } from '../../../lib/amqp/abstract-rpc-handler';
import { LoggerInterface } from '../../../lib/logger.interface';
import { VkAuthorizer } from '../actions/vk/vk-authorizer';
import { ProxyInterface } from '../proxy.interface';
import { VkUserCredentialsInterface } from '../../api/vk-users/vk-user-credentials.interface';
import { createBrowserPage } from '../actions/create-page';
import { hrefByGroupId } from '../../../lib/helper';
import { JoinGroupFailedException } from './join-group-failed.exception';

type TaskArgsType = {
	proxy: ProxyInterface;
	userCredentials: VkUserCredentialsInterface;
	groupId: string;
};

@injectable()
export class JoinGroupRpcHandler extends AbstractRpcHandler {
	@inject('Logger') private readonly logger: LoggerInterface;

	@inject(VkAuthorizer) private readonly vkAuthorizer: VkAuthorizer;

	protected method = 'joinGroup';

	async handle({ proxy, groupId, userCredentials }: TaskArgsType): Promise<object> {
		const groupLink = hrefByGroupId(groupId);
		this.logger.info({
			message: 'Задача на вступление в группу пользователя vk',
			credentials: userCredentials,
			vkGroupLink: groupLink,
			proxy,
		});

		let browser: Browser = null;
		const canRetry = true;
		try {
			const { page, browser: _browser } = await createBrowserPage(proxy);
			browser = _browser;

			await this.vkAuthorizer.authorize(page, {
				login: userCredentials.login,
				password: userCredentials.password,
				proxy,
			});

			await page.goto(groupLink, {
				waitUntil: 'networkidle2',
			});

			const subscribeClicked = await page.evaluate(() => {
				const subscribeButton = document.querySelector<HTMLButtonElement>(
					'#public_subscribe',
				);
				const joinButton = document.querySelector<HTMLButtonElement>('#join_button');
				if (subscribeButton) {
					subscribeButton.click();
					return true;
				}

				if (joinButton) {
					joinButton.click();
					return true;
				}

				return false;
			});

			if (!subscribeClicked) {
				throw new JoinGroupFailedException(
					'already_joined',
					groupLink,
					userCredentials.login,
					false,
				);
			}

			await page.waitForSelector('#page_actions_btn');

			this.logger.info({
				message: 'Подписался в группу',
				credentials: userCredentials,
				vkGroupLink: groupLink,
				proxy,
			});

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