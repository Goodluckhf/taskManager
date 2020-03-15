import { inject, injectable } from 'inversify';
import { Page } from 'puppeteer';
import { CaptchaService } from '../../../../lib/captcha.service';

@injectable()
export class CaptchaSolver {
	constructor(@inject(CaptchaService) private readonly captcha: CaptchaService) {}

	async solveIfHas(page: Page) {
		const hasCaptcha = await page.evaluate(() => !!document.querySelector('.recaptcha iframe'));
		if (!hasCaptcha) {
			return;
		}

		try {
			const captchaUrl = await page.evaluate(() =>
				document.querySelector('.recaptcha iframe').getAttribute('src'),
			);
			const pageUrl = await page.evaluate(() => document.location.href);
			const urlObject = new URL(captchaUrl);
			const siteKey = urlObject.searchParams.get('k');
			const result = await this.captcha.solveRecaptchaV2({
				pageUrl,
				siteKey,
			});
			const captchaNavigationPromise = page.waitForNavigation();
			await page.evaluate(
				token => {
					document.querySelector<HTMLInputElement>(
						'.recaptcha .g-recaptcha-response',
					).value = token;
					document.querySelector<HTMLInputElement>('#quick_recaptcha').value = token;
					document.querySelector<HTMLFormElement>('#quick_login_form').submit();
				},
				result,
				siteKey,
			);
			await captchaNavigationPromise;
		} catch (error) {
			error.code = 'captcha_failed';
			error.canRetry = true;
			throw error;
		}
	}
}
