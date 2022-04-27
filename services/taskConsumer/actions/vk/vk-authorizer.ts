import { inject, injectable } from 'inversify';
import { Page } from 'puppeteer';
import { AggregateError } from 'bluebird';
import bluebird from 'bluebird';
import { LoggerInterface } from '../../../../lib/logger.interface';
import { ProxyInterface } from '../../proxy.interface';
import { AccountException } from '../../rpc-handlers/account.exception';
import { ActionApplier } from './action-applier';

@injectable()
export class VkAuthorizer {
	constructor(
		@inject('Logger') private readonly logger: LoggerInterface,
		@inject(ActionApplier) private readonly actionApplier: ActionApplier,
	) {}

	async signInWithCookie(page: Page, login: string, remixsid: string): Promise<boolean> {
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
		await this.checkAccount(page, login);

		const oldLoginForm = await page.$('#login_form_wrap');
		const newVkIDLoginForm = await page.$('.VkIdForm__form');
		if (oldLoginForm || newVkIDLoginForm) {
			await client.send('Network.deleteCookies', {
				name: 'remixsid',
				domain: '.vk.com',
			});
		}
		return !oldLoginForm && !newVkIDLoginForm;
	}

	private async checkAccount(page: Page, login: string) {
		const blockedElement = await page.$('#login_blocked_wrap');
		if (blockedElement) {
			throw new AccountException('Account is blocked', 'blocked', login, false);
		}

		const oldBrowserElement = await page.$('.bad_browser');
		if (oldBrowserElement) {
			throw new AccountException('Bad browser', 'old_user_agent', login, false);
		}
	}

	async signInOldForm(page: Page, { login, password }: { login: string; password: string }) {
		this.logger.info({
			message: 'Логинимся через старую форму',
			login,
		});
		await page.evaluate(
			(_login, _password) => {
				document.querySelector<HTMLInputElement>('#email').value = _login;
				document.querySelector<HTMLInputElement>('#pass').value = _password;
			},
			login,
			password,
		);

		try {
			await this.actionApplier.click({
				page,
				goalAction: () => page.waitForNavigation({ timeout: 10000 }),
				selector: '#login_button',
				login,
			});
		} catch (error) {
			if (!(error instanceof AggregateError)) {
				throw error;
			}

			await page.reload({ waitUntil: 'networkidle2' });
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
		await this.checkAccount(page, login);
	}

	async signInNewVkIDForm(page: Page, { login, password }: { login: string; password: string }) {
		this.logger.info({
			message: 'Логинимся через новую форму',
			login,
		});
		await this.actionApplier.click({
			page,
			goalAction: () => page.waitForNavigation({ timeout: 10000 }),
			selector: '.VkIdForm__signInButton',
			login,
		});

		await page.type('input[name=login]', login);

		await this.actionApplier.click({
			page,
			goalAction: () => page.waitForSelector('input[name=password]'),
			selector: 'button[type=submit]',
			login,
		});

		await page.type('input[name=password]', password);

		try {
			await this.actionApplier.click({
				page,
				goalAction: () =>
					bluebird.any([
						page.waitForSelector('.vkc__Password__Wrapper .vkc__TextField__errorIcon'),
						page.waitForNavigation({ timeout: 10000 }) as Promise<any>,
					]),
				selector: 'button[type=submit]',
				login,
			});
		} catch (error) {
			if (!(error instanceof AggregateError)) {
				throw error;
			}

			this.logger.warn({
				message: 'Warning при авторизации (нажатие на кнопку авторизоваться)',
				error,
			});

			await page.reload({ waitUntil: 'networkidle2' });
		}

		const loginFailedElement = await page.$(
			'.vkc__Password__Wrapper .vkc__TextField__errorIcon',
		);

		if (loginFailedElement) {
			const errorMessageElement = await page.$(
				'.vkc__TextField__tooltip .vkc__TextField__text',
			);
			const errorMessage = await page.evaluate(el => el.textContent, errorMessageElement);
			throw new AccountException(
				`Account credentials is invalid: [${errorMessage}]`,
				'login_failed',
				login,
				false,
			);
		}

		await this.checkAccount(page, login);
	}

	async signInWithCredentials(
		page: Page,
		{ login, password }: { login: string; password: string },
	) {
		const isOldForm = await page.$('#login_form_wrap');
		if (isOldForm) {
			await this.signInOldForm(page, { login, password });
		} else {
			await this.signInNewVkIDForm(page, { login, password });
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

		let authorized = false;

		if (remixsid) {
			authorized = await this.signInWithCookie(page, login, remixsid);

			if (authorized) {
				this.logger.info({
					message: 'авторизовались через куку',
					remixsid,
					login,
				});
			}
		}

		if (!authorized) {
			await this.signInWithCredentials(page, { login, password });
			this.logger.info({
				message: 'авторизовались через логин пароль',
				password,
				login,
			});
		}

		const client = await page.target().createCDPSession();

		const response: any = await client.send('Network.getAllCookies');
		try {
			const newRemixsid = response.cookies.find(c => c.name === 'remixsid').value;
			return { remixsid: newRemixsid };
		} catch (error) {
			this.logger.error({
				message: 'Ошибка при авторизации',
				error,
			});
			throw new AccountException(
				'Account requires phone confirmation',
				'wrong date',
				login,
				false,
			);
		}
	}
}
