import { inject, injectable } from 'inversify';
import bluebird from 'bluebird';
import { shuffle } from 'lodash';
import { AbstractRpcHandler } from '../../../lib/amqp/abstract-rpc-handler';
import { LoggerInterface } from '../../../lib/logger.interface';
import { VkAuthorizer } from '../actions/vk/vk-authorizer';
import { createBrowserPage } from '../actions/create-page';
import { VkUserCredentialsInterface } from '../../api/vk-users/vk-user-credentials.interface';
import { getRandom } from '../../../lib/helper';
import { PageTransitor } from '../actions/vk/page-transitor';

type ComplainArgs = {
	userCredentials: VkUserCredentialsInterface;
	postLink: string;
};

@injectable()
export class ComplainRpcHandler extends AbstractRpcHandler {
	@inject('Logger') private readonly logger: LoggerInterface;

	@inject(VkAuthorizer) private readonly vkAuthorizer: VkAuthorizer;

	@inject(PageTransitor) private readonly pageTransitor: PageTransitor;

	protected readonly method = 'complain_post';

	static readonly method = 'complain_post';

	async handle({
		userCredentials: { login, password, proxy, remixsid, userAgent },
		postLink,
	}: ComplainArgs) {
		this.logger.info({
			message: 'Задача жалобы на коммент',
			credentials: { login, password, remixsid, userAgent },
			proxy,
			postLink,
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

			await this.pageTransitor.goto(page, postLink);

			let commentIds = await page.evaluate(() => {
				const replies = document.querySelectorAll('#page_wall_posts .replies .reply');
				return [...replies]
					.filter(reply => !reply.classList.contains('reply_deleted'))
					.map(reply => reply.id);
			});

			if (commentIds.length > 50) {
				commentIds = shuffle(shuffle(commentIds)).slice(0, 50);
			}

			await bluebird.map(
				commentIds,
				async id => {
					try {
						await page.evaluate(selector => {
							document.querySelector(selector).click();
						}, `#${id} .reply_delete_button`);
						await page.waitForSelector('.wall_reasons_result .wall_reasons_item');
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
						await this.logger.info({
							message: 'пожаловались на комментарий',
							replyId: id,
							postLink,
						});
						const randomDelay = getRandom(0, 4000);
						await bluebird.delay(randomDelay);
					} catch (error) {
						this.logger.warn({
							message: 'ошибка при жалобе на коммент',
							replyId: id,
							postLink,
							error,
						});
					}
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
