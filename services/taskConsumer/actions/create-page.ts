import vanilaPuppeteer from 'puppeteer';
import { addExtra } from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { ProxyInterface } from '../proxy.interface';

export async function createBrowserPage(proxy: ProxyInterface, userAgent: string) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore
	const puppeteer = addExtra(vanilaPuppeteer);
	const stealth = StealthPlugin();
	stealth.enabledEvasions.delete('user-agent-override');
	puppeteer.use(stealth);

	const puppeteerArgs = [
		'--no-sandbox',
		'--disable-setuid-sandbox',
		'--disable-dev-shm-usage',
		'--disable-accelerated-2d-canvas',
		'--no-first-run',
		'--no-zygote',
		'--disable-gpu',
		'--single-process',
		`--user-agent=${userAgent}`,
	];

	if (proxy) {
		puppeteerArgs.push(`--proxy-server=${proxy.url}`);
	}

	const browser = await puppeteer.launch({
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		args: puppeteerArgs,
		handleSIGINT: false,
		headless: process.env.NODE_ENV === 'production',
	});
	const page = await browser.newPage();
	if (proxy) {
		await page.authenticate({ username: proxy.login, password: proxy.password });
	}

	await page.setRequestInterception(true);
	page.on('request', req => {
		if (
			req.resourceType() === 'stylesheet' ||
			req.resourceType() === 'font' ||
			req.resourceType() === 'image'
		) {
			req.abort();
		} else {
			req.continue();
		}
	});

	return { page, browser, userAgent };
}
