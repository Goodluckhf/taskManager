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

		await this.scrollPosts(page, feedOptions.scrollCount);

		await bluebird.some(
			[this.lookThroughPosts(page), bluebird.delay(120000) as Promise<any>],
			1,
		);
	}

	private async scrollPosts(page: Page, scrollCount) {
		await bluebird.map(
			Array.from({ length: scrollCount }),
			async () => {
				await page.evaluate(() => {
					window.scrollBy(0, 900);
				});

				const randomDelay = getRandom(0, 4000);
				await bluebird.delay(randomDelay);
			},
			{ concurrency: 1 },
		);
	}

	private async lookThroughPosts(page: Page) {
		const posts = await page.$$('.post');
		await bluebird.map(
			posts,
			async post => {
				const shouldLikePost = getRandom(0, 100) > 70;
				const shouldOpenPreview = getRandom(0, 100) > 80;
				const shouldRepost = getRandom(0, 100) > 90;
				if (shouldLikePost) {
					this.logger.info({ message: 'ставим лайк' });
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

	private async likePost(post: ElementHandle) {
		const likeElement = await post.$('a.like_btn.like');
		await likeElement.click();
	}

	private async repost(page: Page, post: ElementHandle) {
		const repostElement = await post.$('a.like_btn.share');
		await repostElement.click();
		await page.waitForSelector('#box_layer .like_share_wrap');
		const canShare = await page.evaluate(() => {
			return !document.querySelector('#like_share_my.disabled');
		});

		if (!canShare) {
			return;
		}
		await page.click('#like_share_my');
		const shouldShareToFriendsOnly = getRandom(0, 100) > 50;
		if (shouldShareToFriendsOnly) {
			await page.click('#like_share_friends_only');
		}
		await page.click('#like_share_send');
		await page.waitForFunction(() => {
			return !document.querySelector('#box_layer .like_share_wrap');
		});
	}

	private async readPreview(page: Page, post: ElementHandle) {
		await post.evaluate(node => {
			node.querySelector<HTMLButtonElement>('a.post_link').click();
		});
		await page.waitForSelector('#wk_box #wl_post');
		await page.evaluate(() => {
			document.querySelector('.wl_replies').scrollIntoView();
		});
		const scrollCount = getRandom(1, 10);
		await bluebird.map(
			Array.from({ length: scrollCount }),
			async () => {
				await page.evaluate(() => {
					document.querySelector('#wk_layer_wrap').scrollBy(0, 450);
				});

				const randomDelay = getRandom(0, 3000);
				await bluebird.delay(randomDelay);
			},
			{ concurrency: 1 },
		);

		const shouldLike = getRandom(0, 100) > 80;
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
