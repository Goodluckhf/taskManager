import { inject, injectable } from 'inversify';
import { Page } from 'puppeteer';
import bluebird, { AggregateError } from 'bluebird';
import { LoggerInterface } from '../../../../lib/logger.interface';
import { ProxyInterface } from '../../proxy.interface';
import { AccountException } from '../../rpc-handlers/account.exception';
import { CaptchaService } from '../../../../lib/captcha.service';

@injectable()
export class VkAuthorizer {
	constructor(
		@inject('Logger') private readonly logger: LoggerInterface,
		@inject(CaptchaService) private readonly captcha: CaptchaService,
	) {}

	async signInWithCooke(page: Page, remixsid: string) {
		const client = await page.target().createCDPSession();
		await client.send('Network.setCookie', {
			name: 'remixsid',
			value: remixsid,
			domain: '.vk.com',
			path: '/',
			secure: true,
			httpOnly: true,
		});
		await page.reload({ waitUntil: 'networkidle2' });
	}

	async signInWithCredentials(
		page: Page,
		{ login, password }: { login: string; password: string },
	) {
		await page.evaluate(
			(_login, _password) => {
				document.querySelector<HTMLInputElement>('#email').value = _login;
				document.querySelector<HTMLInputElement>('#pass').value = _password;
			},
			login,
			password,
		);

		const loginNavigationPromise = page.waitForNavigation({ timeout: 10000 });
		const waitForCaptchaPromise = page.waitFor(
			() => !!document.querySelector('.recaptcha iframe'),
			{ timeout: 10000 },
		);
		await page.click('#login_button');
		await bluebird
			.any([loginNavigationPromise as Promise<any>, waitForCaptchaPromise as Promise<any>])
			.catch(async error => {
				if (error instanceof AggregateError) {
					return page.reload({ waitUntil: 'networkidle2' });
				}

				throw error;
			});

		const hasCaptcha = await page.evaluate(() => !!document.querySelector('.recaptcha iframe'));
		if (hasCaptcha) {
			try {
				const captchaUrl = await page.evaluate(() =>
					document.querySelector('.recaptcha iframe').getAttribute('src'),
				);
				const urlObject = new URL(captchaUrl);
				const siteKey = urlObject.searchParams.get('k');
				const result = await this.captcha.solveRecaptchaV2({
					pageUrl: 'https://vk.com/login',
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
				error.login = login;
				error.canRetry = true;
				throw error;
			}
		}
	}

	async authorize(
		page: Page,
		{
			login,
			password,
			proxy,
			remixsid,
		}: { login: string; password: string; remixsid?: string; proxy: ProxyInterface },
	) {
		try {
			await page.goto('https://vk.com/login', {
				waitUntil: 'networkidle2',
			});
		} catch (error) {
			if (/ERR_PROXY_CONNECTION_FAILED/.test(error.message)) {
				error.code = 'proxy_failure';
				error.proxy = proxy;
			}

			throw error;
		}

		this.logger.info({
			message: 'Прокси жив (зашли на страницу авторизации)',
			proxy,
		});

		if (remixsid) {
			await this.signInWithCooke(page, remixsid);
			this.logger.info({
				message: 'авторизовались через куку',
				remixsid,
				login,
			});
		} else {
			await this.signInWithCredentials(page, { login, password });
			this.logger.info({
				message: 'авторизовались через логин пароль',
				password,
				login,
			});
		}

		const loginFailedElement = await page.$('#login_message .error');
		if (loginFailedElement) {
			throw new AccountException(
				'Account credentials is invalid',
				'login_failed',
				login,
				false,
			);
		}

		const blockedElement = await page.$('#login_blocked_wrap');
		if (blockedElement) {
			throw new AccountException('Account is blocked', 'blocked', login, false);
		}

		const client = await page.target().createCDPSession();
		const response: any = await client.send('Network.getAllCookies');
		return { remixsid: response.cookies.find(c => c.name === 'remixsid').value };
	}
}
