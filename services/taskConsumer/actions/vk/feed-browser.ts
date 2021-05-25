import { ElementHandle, Page } from 'puppeteer';
import bluebird from 'bluebird';
import { inject, injectable } from 'inversify';
import { getRandom } from '../../../../lib/helper';
import { LoggerInterface } from '../../../../lib/logger.interface';

export type FeedOptions = {
	isSmart: boolean;
	commonFeed: boolean;
	recommend: boolean;
	scrollCount: number;
	skipPosts: number;
};

@injectable()
export class FeedBrowser {
	constructor(@inject('Logger') private readonly logger: LoggerInterface) {}

	async browse(page: Page, feedOptions: FeedOptions) {
		await page.goto('https://vk.com/feed', { waitUntil: 'networkidle2' });

		if (feedOptions.recommend) {
			await page.click('#ui_rmenu_recommended');
			await bluebird.delay(5000);
		} else if (feedOptions.isSmart) {
			await page.click('#feed_filters div.hot');
			await bluebird.delay(5000);
		}

		await this.scrollPosts(page, feedOptions);

		await bluebird.some(
			[this.lookThroughPosts(page, feedOptions), bluebird.delay(120000) as Promise<any>],
			1,
		);
	}

	private async scrollPosts(page: Page, options: FeedOptions) {
		await bluebird.map(
			Array.from({ length: options.scrollCount }),
			async () => {
				await page.evaluate(() => {
					window.scrollBy(0, 900);
				});

				const randomDelay = getRandom(0, 3000);
				await bluebird.delay(randomDelay);
			},
			{ concurrency: 1 },
		);
	}

	private async lookThroughPosts(page: Page, feedOptions: FeedOptions) {
		const isEmpty = await page.evaluate(() => {
			return document.querySelector('#main_feed.feed_is_empty');
		});
		if (isEmpty) {
			const recommendations = await page.$$('.feed_asc_user_row');
			const randomSubElement = recommendations[getRandom(0, recommendations.length - 1)];
			await randomSubElement.evaluate(node => {
				node.querySelector('button.feed_asc_user_subscribe_btn').click();
			});
			return;
		}
		let posts = await page.$$('.post');
		posts = posts.slice(feedOptions.skipPosts);
		await bluebird.map(
			posts,
			async post => {
				const shouldLikePost = getRandom(0, 100) > 60;
				const shouldOpenPreview = getRandom(0, 100) > 80;
				const shouldRepost = getRandom(0, 100) > 80;
				if (shouldLikePost) {
					await this.likePost(post);
				}

				if (shouldOpenPreview) {
					this.logger.info({ message: 'читаем пост' });
					await this.readPreview(page, post);
				}

				if (shouldRepost) {
					this.logger.info({ message: 'делаем репост' });
					await this.repost(page, post);
				}

				if (shouldRepost || shouldLikePost) {
					const randomDelay = getRandom(0, 3000);
					await bluebird.delay(randomDelay);
				}
			},
			{ concurrency: 1 },
		);
	}

	async likePost(post: ElementHandle) {
		const alreadyLiked = await post.evaluate(node => {
			return node.querySelector('a.like_btn.like.active');
		});

		if (alreadyLiked) {
			this.logger.info({
				message: 'Уже лайкнул ранее',
			});
			return false;
		}

		this.logger.info({ message: 'ставим лайк' });
		await post.evaluate(node => {
			node.querySelector('a.like_btn.like').click();
		});
		return true;
	}

	async repost(page: Page, post: ElementHandle) {
		await post.evaluate(node => {
			node.querySelector('a.like_btn.share').click();
		});
		await page.waitForSelector('#box_layer .like_share_wrap', { timeout: 5000 });
		const canShare = await page.evaluate(() => {
			return !document.querySelector('#like_share_my.disabled');
		});

		if (!canShare) {
			return false;
		}

		await page.evaluate(() =>
			document.querySelector<HTMLAnchorElement>('#like_share_my').click(),
		);
		const shouldShareToFriendsOnly = getRandom(0, 100) > 50;
		if (shouldShareToFriendsOnly) {
			await page.evaluate(() =>
				document.querySelector<HTMLAnchorElement>('#like_share_friends_only').click(),
			);
		}
		await page.evaluate(() =>
			document.querySelector<HTMLAnchorElement>('#like_share_send').click(),
		);
		await page.waitForFunction(() => {
			return !document.querySelector('#box_layer .like_share_wrap');
		});

		return true;
	}

	private async readPreview(page: Page, post: ElementHandle) {
		await post.evaluate(node => {
			node.querySelector('a.post_link').click();
		});
		await page.waitForSelector('#wk_box #wl_post');
		await page.evaluate(() => {
			document.querySelector('.wl_replies').scrollIntoView();
		});
		const scrollCount = getRandom(1, 5);
		await bluebird.map(
			Array.from({ length: scrollCount }),
			async () => {
				await page.evaluate(() => {
					document.querySelector('#wk_layer_wrap').scrollBy(0, 600);
				});

				const randomDelay = getRandom(0, 2000);
				await bluebird.delay(randomDelay);
			},
			{ concurrency: 1 },
		);

		const shouldLike = getRandom(0, 100) > 70;
		const comments = await page.$$('.reply');
		if (shouldLike && comments.length > 0) {
			const commentToLike = comments[getRandom(0, comments.length - 1)];
			const likeButton = await commentToLike.$('a.like_btn.like');
			await likeButton.click();
		}

		this.logger.info({ message: 'закрываем попап поста' });

		await page.click('.wk_close');
	}
}
