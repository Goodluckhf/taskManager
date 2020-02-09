import { injectable } from 'inversify';
import { Page } from 'puppeteer';
import bluebird from 'bluebird';
import { getRandom } from '../../../../lib/helper';

type Options = {
	isPopular: boolean;
	isCommon: boolean;
	scrollCount: number;
	shouldChangeCategory: boolean;
	shouldGotoGroup: boolean;
};

@injectable()
export class GroupBrowser {
	async browse(page: Page, options: Options) {
		await page.click('#l_gr a');
		await page.waitForSelector('#groups_list_content');
		if (options.isPopular) {
			await this.lookPopular(page, options);
		}

		await bluebird.delay(2000);
		await this.lookGroups(page, options.scrollCount);
		if (options.shouldGotoGroup) {
			await this.goToGroup(page);
		}
	}

	private async lookPopular(page: Page, options: Options) {
		await page.click('#ui_rmenu_category0');
		if (options.shouldChangeCategory) {
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
	}

	private async lookGroups(page: Page, scrollCount: number) {
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
}
