import { ElementHandle, Page } from 'puppeteer';
import bluebird from 'bluebird';
import { injectable } from 'inversify';
import { getRandom } from '../../../../lib/helper';

@injectable()
export class FeedBrowser {
	async browse(page: Page) {
		await page.goto('https://vk.com/feed', { waitUntil: 'networkidle2' });

		const shouldLookNews = getRandom(0, 100) > 50;

		if (shouldLookNews) {
			const shouldSwitchSmartFeed = getRandom(0, 100) > 50;
			if (shouldSwitchSmartFeed) {
				await page.click('#feed_filters div.hot');
				await bluebird.delay(1000);
			}
		} else {
			await page.click('#ui_rmenu_recommended');
			await bluebird.delay(1000);
		}

		await bluebird.some(
			[this.lookThroughPosts(page), bluebird.delay(120000) as Promise<any>],
			1,
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
					await this.likePost(page, post);
				}

				if (shouldOpenPreview) {
					await this.readPreview(page, post);
				}

				if (shouldRepost) {
					await this.repost(page, post);
				}
			},
			{ concurrency: 1 },
		);

		const scrollCount = getRandom(1, 20);
		await bluebird.map(
			Array.from({ length: scrollCount }),
			async () => {
				await page.evaluate(() => {
					window.scrollBy(0, 450);
				});

				const randomDelay = getRandom(0, 8000);
				await bluebird.delay(randomDelay);
			},
			{ concurrency: 1 },
		);
	}

	private async likePost(page: Page, post: ElementHandle) {
		const likeElement = await post.$('a.like_btn.like');
		await likeElement.click();
	}

	private async repost(page: Page, post: ElementHandle) {
		const repostElement = await post.$('a.like_btn.share');
		await repostElement.click();
		await page.waitForSelector('#box_layer .like_share_wrap');
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
		const postLinkElement = await post.$('a.post_link');
		await postLinkElement.click();
		await page.waitForSelector('#wk_box #wl_post');
		let timeSpendReadingComments = 0;
		await page.evaluate(() => {
			document.querySelector('.wl_replies').scrollIntoView();
		});
		while (timeSpendReadingComments < 10000) {
			timeSpendReadingComments += 1500;
			await page.evaluate(() => {
				document.querySelector('#wk_layer_wrap').scrollBy(0, 200);
			});

			const randomDelay = getRandom(0, 4000);
			await bluebird.delay(randomDelay);
		}

		const shouldLike = getRandom(0, 100) > 80;
		if (shouldLike) {
			const comments = await page.$$('.reply');
			const commentToLike = comments[getRandom(0, comments.length - 1)];
			const likeButton = await commentToLike.$('a.like_btn.like');
			await likeButton.click();
		}

		await page.click('#wk_close');
	}
}
