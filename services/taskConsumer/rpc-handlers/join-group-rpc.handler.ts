import { inject, injectable } from 'inversify';
import { Browser } from 'puppeteer';
import { AbstractRpcHandler } from '../../../lib/amqp/abstract-rpc-handler';
import { LoggerInterface } from '../../../lib/logger.interface';
import { VkAuthorizer } from '../actions/vk/vk-authorizer';
import { VkUserCredentialsInterface } from '../../api/vk-users/vk-user-credentials.interface';
import { createBrowserPage } from '../actions/create-page';
import { hrefByGroupId } from '../../../lib/helper';
import { JoinGroupFailedException } from './join-group-failed.exception';
import { AccountException } from './account.exception';

type TaskArgsType = {
	userCredentials: VkUserCredentialsInterface;
	groupId: string;
};

@injectable()
export class JoinGroupRpcHandler extends AbstractRpcHandler {
	@inject('Logger') private readonly logger: LoggerInterface;

	@inject(VkAuthorizer) private readonly vkAuthorizer: VkAuthorizer;

	protected readonly method = 'joinGroup';

	static readonly method = 'joinGroup';

	async handle({ groupId, userCredentials }: TaskArgsType): Promise<object> {
		const groupLink = hrefByGroupId(groupId);
		this.logger.info({
			message: 'Задача на вступление в группу пользователя vk',
			credentials: userCredentials,
			vkGroupLink: groupLink,
		});

		let browser: Browser = null;
		const canRetry = true;
		try {
			const { page, browser: _browser } = await createBrowserPage(
				userCredentials.proxy,
				userCredentials.userAgent,
			);
			browser = _browser;

			const { remixsid } = await this.vkAuthorizer.authorize(page, {
				login: userCredentials.login,
				password: userCredentials.password,
				proxy: userCredentials.proxy,
				remixsid: userCredentials.remixsid,
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

			await page.waitForFunction(() => {
				const form = document.querySelector('#validation_phone_row');
				if (form) {
					return true;
				}

				return !!document.querySelector('#page_actions_btn');
			});

			const needPhoneConfirmation = await page.evaluate(() => {
				const form = document.querySelector('#validation_phone_row');
				return !!form;
			});

			if (needPhoneConfirmation) {
				throw new AccountException(
					'Account requires phone confirmation',
					'phone_required',
					userCredentials.login,
					false,
				);
			}

			await page.waitForSelector('#page_actions_btn');

			this.logger.info({
				message: 'Подписался в группу',
				credentials: userCredentials,
				vkGroupLink: groupLink,
			});

			return { remixsid };
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
