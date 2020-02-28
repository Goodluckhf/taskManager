import { injectable } from 'inversify';
import { Page } from 'puppeteer';

@injectable()
export class PageTransitor {
	async goto(page: Page, url: string) {
		await page.goto(url, { waitUntil: 'networkidle2' });
	}
}
