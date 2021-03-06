import { inject, injectable } from 'inversify';
import bluebird from 'bluebird';
import { shuffle } from 'lodash';
import { Browser, Page, ElementHandle } from 'puppeteer';
import { VkAuthorizer } from '../actions/vk/vk-authorizer';
import { AbstractRpcHandler } from '../../../lib/amqp/abstract-rpc-handler';
import { VkUserCredentialsInterface } from '../../api/vk-users/vk-user-credentials.interface';
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
				await browser.close();
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
			await page.waitForFunction(
				() => {
					return window.scrollY === 0;
				},
				{ timeout: 5000 },
			);
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
		let processedPosts = 0;
		let seenPosts = 0;
		await bluebird.map(
			posts,
			async post => {
				const id = await post.evaluate(node => node.id);
				if (!postIdsHash[id]) {
					return;
				}

				try {
					const liked = await this.feedBrowser.likePost(post);

					const repliesCount = await post.evaluate(node => {
						return node.querySelectorAll('.reply').length;
					});
					const commentsOpened = await post.evaluate(node => {
						const button = node.querySelector('a.replies_next_main');
						if (button) {
							button.click();
							return true;
						}
						return false;
					});

					if (commentsOpened) {
						await page.waitForFunction(
							(node, beforeCount) => {
								const currentLength = node.querySelectorAll('.reply').length;
								return currentLength > beforeCount;
							},
							{ timeout: 5000 },
							post,
							repliesCount,
						);

						await this.setLikesToRandomComments(post);
					}

					if (liked) {
						processedPosts += 1;
					}
					seenPosts += 1;

					const randomDelay = getRandom(0, 3000);
					await bluebird.delay(randomDelay);
				} catch (error) {
					this.logger.warn({
						message: 'ошибка в найденном посте',
						postId: id,
						error,
					});
				}
			},
			{ concurrency: 1 },
		);

		this.logger.info({
			message: 'обработано постов | увеличение охвата',
			count: processedPosts,
			seenCount: seenPosts,
		});
	}

	async setLikesToRandomComments(post: ElementHandle) {
		const replies = await post.$$('.reply');
		const likesCount = getRandom(1, 2);
		const repliesToLike = shuffle(replies).slice(0, likesCount);
		await bluebird.map(
			repliesToLike,
			async reply => {
				await reply.evaluate(node => {
					const likeButton = node.querySelector('a.like_btn');
					if (likeButton && !likeButton.classList.contains('active')) {
						likeButton.click();
					}
				});
			},
			{ concurrency: 1 },
		);
	}

	async preloadPosts(page: Page) {
		const getMoreCount = getRandom(4, 10);

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
