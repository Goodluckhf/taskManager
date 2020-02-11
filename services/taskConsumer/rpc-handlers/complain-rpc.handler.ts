import { inject, injectable } from 'inversify';
import bluebird from 'bluebird';
import { AbstractRpcHandler } from '../../../lib/amqp/abstract-rpc-handler';
import { LoggerInterface } from '../../../lib/logger.interface';
import { VkAuthorizer } from '../actions/vk/vk-authorizer';
import { createBrowserPage } from '../actions/create-page';
import { VkUserCredentialsInterface } from '../../api/vk-users/vk-user-credentials.interface';

type ComplainArgs = {
	userCredentials: VkUserCredentialsInterface;
	commentLink: string;
};

@injectable()
export class ComplainRpcHandler extends AbstractRpcHandler {
	@inject('Logger') private readonly logger: LoggerInterface;

	@inject(VkAuthorizer) private readonly vkAuthorizer: VkAuthorizer;

	protected readonly method = 'complain_comment';

	static readonly method = 'complain_comment';

	async handle({
		userCredentials: { login, password, proxy, remixsid, userAgent },
		commentLink,
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
			await this.vkAuthorizer.authorize(page, {
				login,
				password,
				proxy,
				remixsid,
			});

			await page.goto(commentLink, { waitUntil: 'networkidle2' });
			const url = new URL(commentLink);
			const replyId = url.searchParams.get('reply');
			const postId = url.pathname.replace(/.+wall/, '').replace(/_.+/, '');
			this.logger.info({
				message: 'commentId для жалобы',
				commentId: `#reply_delete${postId}_${replyId}`,
			});
			const commentExists = await page.$(`#reply_delete${postId}_${replyId}`);
			if (!commentExists) {
				this.logger.info({
					message: 'Коммент уже удалили',
					commentLink,
				});
				return {};
			}
			await page.evaluate(selector => {
				document.querySelector(selector).click();
			}, `#reply_delete${postId}_${replyId}`);

			await page.waitForSelector('.wall_reasons_result');
			await page.evaluate(() => {
				document
					.querySelector<HTMLButtonElement>('.wall_reasons_list .wall_reasons_item')
					.click();
			});
			await page.waitForSelector('.ReportConfirmationPopup');
			await page.evaluate(selector => {
				document.querySelector(selector).click();
			}, '.ReportConfirmationPopup__footer__submit-button');

			await page.waitForSelector('#notifiers_wrap .notifier_baloon_msg');
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
