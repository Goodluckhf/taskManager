import vanilaPuppeteer from 'puppeteer';
import { addExtra } from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { ProxyInterface } from '../proxy.interface';
import { userAgents } from '../../../lib/user-agents';
import { getRandom } from '../../../lib/helper';

export async function createBrowserPage(proxy: ProxyInterface, userAgent?: string) {
	if (!userAgent) {
		const random = getRandom(0, userAgents.length - 1);
		userAgent = userAgents[random];
	}
	const puppeteer = addExtra(vanilaPuppeteer);
	puppeteer.use(StealthPlugin());

	const puppeteerArgs = [
		'--no-sandbox',
		'--disable-setuid-sandbox',
		'--disable-dev-shm-usage',
		'--disable-accelerated-2d-canvas',
		'--disable-gpu',
		`--user-agent=${userAgent}`,
	];

	if (proxy) {
		puppeteerArgs.push(`--proxy-server=${proxy.url}`);
	}

	const browser = await puppeteer.launch({
		args: puppeteerArgs,
		handleSIGINT: false,
		headless: process.env.NODE_ENV === 'production',
	});
	const page = await browser.newPage();
	if (proxy) {
		await page.authenticate({ username: proxy.login, password: proxy.password });
	}

	return { page, browser, userAgent };
}
