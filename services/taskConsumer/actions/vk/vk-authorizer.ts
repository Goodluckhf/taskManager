import { inject, injectable } from 'inversify';
import { Page } from 'puppeteer';
import { AggregateError } from 'bluebird';
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

		const loginForm = await page.$('#login_form_wrap');
		if (loginForm) {
			await client.send('Network.deleteCookies', {
				name: 'remixsid',
				domain: '.vk.com',
			});
		}
		return !loginForm;
	}

	private async checkAccount(page: Page, login: string) {
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

		await this.checkAccount(page, login);
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
