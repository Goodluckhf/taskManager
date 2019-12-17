import vanilaPuppeteer from 'puppeteer';
import { addExtra } from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

/**
 *
 * @param {Object} proxy
 * @returns {Promise<{browser: Browser, page: Page}>}
 */
// eslint-disable-next-line import/prefer-default-export
export const createBrowserPage = async proxy => {
	const puppeteer = addExtra(vanilaPuppeteer);
	puppeteer.use(StealthPlugin());

	const puppeteerArgs = [
		'--no-sandbox',
		'--disable-setuid-sandbox',
		'--disable-dev-shm-usage',
		'--disable-accelerated-2d-canvas',
		'--disable-gpu',
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

	return { page, browser };
};
