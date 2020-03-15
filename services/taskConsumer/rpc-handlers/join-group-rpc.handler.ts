import { inject, injectable } from 'inversify';
import { Browser } from 'puppeteer';
import { AbstractRpcHandler } from '../../../lib/amqp/abstract-rpc-handler';
import { LoggerInterface } from '../../../lib/logger.interface';
import { VkAuthorizer } from '../actions/vk/vk-authorizer';
import { VkUserCredentialsInterface } from '../../api/vk-users/vk-user-credentials.interface';
import { createBrowserPage } from '../actions/create-page';
import { hrefByGroupId } from '../../../lib/helper';
import { JoinGroupFailedException } from './join-group-failed.exception';
import { ActionApplier } from '../actions/vk/action-applier';

type TaskArgsType = {
	userCredentials: VkUserCredentialsInterface;
	groupId: string;
};

@injectable()
export class JoinGroupRpcHandler extends AbstractRpcHandler {
	@inject('Logger') private readonly logger: LoggerInterface;

	@inject(VkAuthorizer) private readonly vkAuthorizer: VkAuthorizer;

	@inject(ActionApplier) private readonly actionApplier: ActionApplier;

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

			const hasDisclaimer = await page.evaluate(() => {
				return !!document.querySelector('.group_age_disclaimer');
			});

			if (hasDisclaimer) {
				await page.evaluate(() => {
					document.querySelector<HTMLButtonElement>('.group_age_checkbox').click();
					document.querySelector<HTMLButtonElement>('.flat_button').click();
				});
			}

			const subscribeClicked = await this.actionApplier.callback({
				callback: () => {
					return page.evaluate(() => {
						const subscribeButton = document.querySelector<HTMLButtonElement>(
							'#public_subscribe',
						);
						const joinButton = document.querySelector<HTMLButtonElement>(
							'#join_button',
						);
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
				},
				login: userCredentials.login,
				goalAction: () => page.waitForSelector('#page_actions_btn'),
				page,
			});

			if (!subscribeClicked) {
				throw new JoinGroupFailedException(
					'already_joined',
					groupLink,
					userCredentials.login,
					false,
				);
			}

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
