import { inject, injectable } from 'inversify';
import bluebird from 'bluebird';
import { VkAuthorizer } from '../actions/vk/vk-authorizer';
import { AbstractRpcHandler } from '../../../lib/amqp/abstract-rpc-handler';
import { VkUserCredentialsInterface } from '../../api/vk-users/vk-user-credentials.interface';
import { Browser, Page } from 'puppeteer';
import { createBrowserPage } from '../actions/create-page';
import { LoggerInterface } from '../../../lib/logger.interface';
import { PageTransitor } from '../actions/vk/page-transitor';
import { getRandom, postIdByLink } from '../../../lib/helper';
import { FeedBrowser } from '../actions/vk/feed-browser';

type CoverageImprovementArgument = {
	userCredentials: VkUserCredentialsInterface;
	postLinks: string[];
};

@injectable()
export class CoverageImprovementRcpHandler extends AbstractRpcHandler {
	protected readonly method = 'coverage_improvement';

	static readonly method = 'coverage_improvement';

	@inject(PageTransitor) private readonly pageTransitor: PageTransitor;

	@inject(FeedBrowser) private readonly feedBrowser: FeedBrowser;

	@inject(VkAuthorizer) private readonly vkAuthorizer: VkAuthorizer;

	@inject('Logger') private readonly logger: LoggerInterface;

	async handle(args: CoverageImprovementArgument): Promise<object> {
		const { userCredentials } = args;
		this.logger.info({
			message: 'Задача на улучшение охвата',
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

			const { remixsid } = await this.vkAuthorizer.authorize(page, {
				login: userCredentials.login,
				password: userCredentials.password,
				proxy: userCredentials.proxy,
				remixsid: userCredentials.remixsid,
			});

			await this.browse(page, args.postLinks);

			return { remixsid };
		} catch (error) {
			error.canRetry = typeof error.canRetry !== 'undefined' ? error.canRetry : canRetry;
			throw error;
		} finally {
			if (browser) {
				// await browser.close();
			}
		}
	}

	async browse(page: Page, postLinks: string[]) {
		await this.pageTransitor.goto(page, 'https://vk.com/feed');
		await page.evaluate(() => {
			window.scrollBy(0, 500);
		});

		const isHot = await page.$('#feed_filters .hot ._ui_toggler.on');

		if (!isHot) {
			await page.click('#feed_filters div.hot');
			// неявно дожидаемся, пока обновится список постов
			await page.waitForFunction(() => {
				return window.scrollY === 0;
			});
		}

		await this.preloadPosts(page);
		await page.evaluate(() => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			window.Feed.showNewPosts();
		});
		const postIdsHash = postLinks.reduce((o, link) => {
			const id = `post${postIdByLink(link)}`;
			o[id] = id;

			return o;
		}, {});

		const posts = await page.$$('.post');
		await bluebird.map(
			posts,
			async post => {
				const id = await post.evaluate(node => node.id);
				if (!postIdsHash[id]) {
					return;
				}

				await this.feedBrowser.likePost(post);
				await this.feedBrowser.repost(page, post);
				await post.evaluate(node =>
					node.querySelector<HTMLAnchorElement>('a.replies_next_main').click(),
				);
				const randomDelay = getRandom(0, 3000);
				await bluebird.delay(randomDelay);
			},
			{ concurrency: 1 },
		);
	}

	async preloadPosts(page: Page) {
		const getMoreCount = getRandom(5, 14);

		await bluebird.map(
			Array.from({ length: getMoreCount }),
			async () => {
				await page.evaluate(() => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
					// @ts-ignore
					window.Feed.showMore();
				});
				const randomDelay = getRandom(0, 3000);
				await bluebird.delay(randomDelay);
			},
			{ concurrency: 1 },
		);
	}
}
