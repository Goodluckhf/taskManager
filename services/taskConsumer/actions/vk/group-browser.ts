import { inject, injectable } from 'inversify';
import { Page } from 'puppeteer';
import bluebird from 'bluebird';
import { getRandom } from '../../../../lib/helper';
import { LoggerInterface } from '../../../../lib/logger.interface';

type Options = {
	isPopular: boolean;
	isCommon: boolean;
	scrollCount: number;
	shouldChangeCategory: boolean;
	shouldGotoGroup: boolean;
};

@injectable()
export class GroupBrowser {
	constructor(@inject('Logger') private readonly logger: LoggerInterface) {}

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
			const categories = await page.$$('#ui_rmenu_category0_list .ui_rmenu_subitem');

			const randomCategory = categories[getRandom(0, categories.length - 1)];
			await randomCategory.click();
		}
	}

	private async goToGroup(page: Page) {
		let groups = await page.$$('.group_list_row');
		if (groups.length === 0) {
			groups = await page.$$('.groups_row');
		}

		if (groups.length === 0) {
			return;
		}

		this.logger.info({ message: 'заходим в группу' });
		const randomGroup = groups[getRandom(0, groups.length - 1)];
		await randomGroup.evaluate(node => {
			let href = node.querySelector('.img a');
			if (!href) {
				href = node.querySelector('a.group_row_photo');
			}
			href.click();
		});
		await page.waitForSelector('#page_wall_posts');
		await bluebird.delay(2000);
	}

	private async lookGroups(page: Page, scrollCount: number) {
		await bluebird.map(
			Array.from({ length: scrollCount }),
			async () => {
				await page.evaluate(() => {
					window.scrollBy(0, 600);
				});

				const randomDelay = getRandom(0, 4000);
				await bluebird.delay(randomDelay);
			},
			{ concurrency: 1 },
		);
	}
}
