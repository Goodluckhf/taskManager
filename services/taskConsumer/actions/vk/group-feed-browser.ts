import { injectable } from 'inversify';
import { Page } from 'puppeteer';
import bluebird from 'bluebird';
import { getRandom } from '../../../../lib/helper';

type Options = {
	scrollCount: number;
};

@injectable()
export class GroupFeedBrowser {
	async browse(page: Page, options: Options) {
		await this.scrollWall(page, options.scrollCount);
	}

	private async scrollWall(page: Page, scrollCount) {
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
