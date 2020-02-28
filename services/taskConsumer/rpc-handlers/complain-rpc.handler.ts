import { inject, injectable } from 'inversify';
import bluebird from 'bluebird';
import { AbstractRpcHandler } from '../../../lib/amqp/abstract-rpc-handler';
import { LoggerInterface } from '../../../lib/logger.interface';
import { VkAuthorizer } from '../actions/vk/vk-authorizer';
import { createBrowserPage } from '../actions/create-page';
import { VkUserCredentialsInterface } from '../../api/vk-users/vk-user-credentials.interface';
import { getRandom } from '../../../lib/helper';

type ComplainArgs = {
	userCredentials: VkUserCredentialsInterface;
	postLink: string;
};

@injectable()
export class ComplainRpcHandler extends AbstractRpcHandler {
	@inject('Logger') private readonly logger: LoggerInterface;

	@inject(VkAuthorizer) private readonly vkAuthorizer: VkAuthorizer;

	protected readonly method = 'complain_comment';

	static readonly method = 'complain_comment';

	async handle({
		userCredentials: { login, password, proxy, remixsid, userAgent },
		postLink,
	}: ComplainArgs) {
		this.logger.info({
			message: 'Задача жалобы на коммент',
			credentials: { login, password, remixsid, userAgent },
			proxy,
		});

		const canRetry = true;
		/**
		 * @type {Browser}
		 */
		let browser = null;
		try {
			const { page, browser: _browser } = await createBrowserPage(proxy, userAgent);
			browser = _browser;
			const { remixsid: newRemixsid } = await this.vkAuthorizer.authorize(page, {
				login,
				password,
				proxy,
				remixsid,
			});

			await page.goto(postLink, { waitUntil: 'networkidle2' });

			const commentIds = page.evaluate(() => {
				const replies = document.querySelectorAll('#page_wall_posts .replies .reply');
				return [...replies].map(reply => reply.id);
			});

			await bluebird.map(
				commentIds,
				async id => {
					await page.evaluate(selector => {
						document.querySelector(selector).click();
					}, `#${id} .reply_delete_button`);
					await page.waitForSelector('.wall_reasons_result');
					await page.evaluate(() => {
						document
							.querySelector<HTMLButtonElement>(
								'.wall_reasons_list .wall_reasons_item',
							)
							.click();
					});
					await page.waitForSelector('.ReportConfirmationPopup');
					await page.evaluate(selector => {
						document.querySelector(selector).click();
					}, '.ReportConfirmationPopup__footer__submit-button');
					await page.waitForSelector('#notifiers_wrap .notifier_baloon_msg');
					const randomDelay = getRandom(0, 5000);
					await bluebird.delay(randomDelay);
				},
				{ concurrency: 1 },
			);

			return { remixsid: newRemixsid };
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
