import { injectable } from 'inversify';
import { Page } from 'puppeteer';
import bluebird from 'bluebird';
import { getRandom } from '../../../../lib/helper';

@injectable()
export class GroupBrowser {
	async browse(page: Page) {
		await page.click('#l_gr a');
		await page.waitForSelector('#groups_list_content');
		const shouldLookPopular = getRandom(0, 100) > 50;
		if (shouldLookPopular) {
			await this.lookPopular(page);
		}

		await bluebird.delay(2000);
		await this.lookGroups(page);

		const shouldGoToGroup = getRandom(0, 100) > 30;
		if (!shouldGoToGroup) {
			return;
		}

		await this.goToGroup(page);
	}

	private async lookPopular(page: Page) {
		await page.click('#ui_rmenu_category0');
		const shouldChangeCategory = getRandom(0, 100) > 50;
		if (shouldChangeCategory) {
			const categories = await page.$$('#ui_rmenu_category0_list ._ui_rmenu_sublist');

			const randomCategory = categories[getRandom(0, categories.length - 1)];
			await randomCategory.click();
		}
	}

	private async goToGroup(page: Page) {
		const groups = await page.$$('.group_list_row');
		if (groups.length === 0) {
			return;
		}

		const randomGroup = groups[getRandom(0, groups.length - 1)];
		const groupTitle = await randomGroup.$('a.group_row_title');
		await groupTitle.click();
		await page.waitForSelector('#page_wall_posts');

		await this.scrollWall(page);
	}

	private async lookGroups(page: Page) {
		const scrollCount = getRandom(1, 20);
		await bluebird.map(
			Array.from({ length: scrollCount }),
			async () => {
				await page.evaluate(() => {
					window.scrollBy(0, 350);
				});

				const randomDelay = getRandom(0, 8000);
				await bluebird.delay(randomDelay);
			},
			{ concurrency: 1 },
		);
	}

	private async scrollWall(page: Page) {
		const shouldScrollPosts = getRandom(0, 100) > 50;
		if (!shouldScrollPosts) {
			return;
		}
		const scrollCount = getRandom(0, 15);

		await bluebird.map(
			Array.from({ length: scrollCount }),
			async () => {
				await page.evaluate(() => {
					window.scrollBy(0, 400);
				});

				const randomDelay = getRandom(0, 5000);
				await bluebird.delay(randomDelay);
			},
			{ concurrency: 1 },
		);
	}
}
