import { injectable } from 'inversify';
import { ElementHandle, Page } from 'puppeteer';
import bluebird from 'bluebird';
import { getRandom } from '../../../../lib/helper';

@injectable()
export class MessageReader {
	async readMessages(page: Page) {
		await page.click('#l_msg a');
		await page.waitForSelector('#im_dialogs');
		await page.click('#ui_rmenu_unread');
		await bluebird.delay(1000);
		const unreadDialogs = await page.$$('.nim-dialog_unread');
		if (unreadDialogs.length === 0) {
			await page.evaluate(selector => {
				document.querySelector(selector).click();
			}, 'a.top_home_link');
			return;
		}

		const randomDialog = unreadDialogs[getRandom(0, unreadDialogs.length - 1)];
		await this.readDialog(page, randomDialog);
	}

	private async readDialog(page: Page, dialog: ElementHandle) {
		const previewElement = await dialog.$('.nim-dialog--text-preview');
		await previewElement.click();
		await page.waitForFunction(() => {
			const messages = document.querySelectorAll('.im-page--chat-body .im-page-chat-contain');
			return messages.length > 0;
		});
	}
}
