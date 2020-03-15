import { inject, injectable } from 'inversify';
import { Page } from 'puppeteer';
import bluebird from 'bluebird';
import { CaptchaSolver } from './captcha-solver';
import { AccountException } from '../../rpc-handlers/account.exception';

export type ActionArgs = {
	page: Page;
	goalAction: Function;
	login: string;
};

export type ClickActionArgs = ActionArgs & {
	selector: string;
};

export type CallbackAction = ActionArgs & {
	callback: Function;
};

@injectable()
export class ActionApplier {
	constructor(@inject(CaptchaSolver) private readonly captchaSolver: CaptchaSolver) {}

	async click({ page, goalAction, selector, login }: ClickActionArgs) {
		return this.callback({
			callback: () => {
				return page.evaluate(selectorForClick => {
					document.querySelector<HTMLButtonElement>(selectorForClick).click();
				}, selector);
			},
			page,
			login,
			goalAction,
		});
	}

	async callback({ callback, page, goalAction, login }: CallbackAction) {
		const waitForCaptchaPromise = page.waitFor(
			() => !!document.querySelector('.recaptcha iframe'),
			{ timeout: 10000 },
		);

		const waitForPhoneConfirmation = page.waitForFunction(
			() => !!document.querySelector('#validation_phone_row'),
			{ timeout: 10000 },
		);

		const result = await callback();

		await bluebird.any([waitForCaptchaPromise, goalAction(), waitForPhoneConfirmation]);
		try {
			await this.captchaSolver.solveIfHas(page);
		} catch (error) {
			error.login = login;
			throw error;
		}
		const needPhoneConfirmation = await page.evaluate(
			() => !!document.querySelector('#validation_phone_row'),
		);

		if (needPhoneConfirmation) {
			throw new AccountException(
				'Account requires phone confirmation',
				'phone_required',
				login,
				false,
			);
		}

		return result;
	}
}
