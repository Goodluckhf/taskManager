import puppeteer from 'puppeteer-extra';
import { maxBy } from 'lodash';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import Response from '../../../lib/amqp/Response';

puppeteer.use(StealthPlugin());
/**
 * @property {VkApi} vkApi
 */
class WallCheckBanResponse extends Response {
	/**
	 * @return {String}
	 */
	// eslint-disable-next-line class-methods-use-this,
	get method() {
		return 'postComment';
	}

	async process({ credentials: { login, password }, postLink, text, imageURL, replyTo, proxy }) {
		const puppeteerArgs = [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
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

		await page.goto('https://vk.com/login', {
			waitUntil: 'networkidle2',
		});

		await page.evaluate(
			(_login, _password) => {
				document.querySelector('#email').value = _login;
				document.querySelector('#pass').value = _password;
			},
			login,
			password,
		);

		const loginNavigationPromise = page.waitForNavigation();
		await page.click('#login_button');
		await loginNavigationPromise;
		// @TODO: здесь нужно обработать баны

		await page.goto(postLink, {
			waitUntil: 'networkidle2',
		});

		await page.waitForSelector('.wl_post');

		let postId = postLink.replace(/.*\?w=wall-/, '-').replace(/&.*$/, '');

		if (replyTo) {
			postId = replyTo;
			await page.click(`#post${postId}`);
			postId = await page.evaluate(_postId => {
				const parent = document.querySelector(`#post${_postId}`).parentNode;
				if (parent.className === 'replies_list_deep') {
					return parent.getAttribute('id').replace('replies', '');
				}

				return _postId;
			}, postId);
		}

		const input = await page.$(`#reply_field${postId}`);
		await input.type(` ${text}`);

		if (imageURL) {
			await input.type(` ${imageURL} `);
			await page.waitForSelector(`#submit_reply${postId} img.page_preview_photo`);

			// Удаляем из текста ссылку
			await page.evaluate(
				(_text, _postId) => {
					document.querySelector(`#reply_field${_postId}`).innerText = _text;
				},
				text,
				postId,
			);
		}

		const postsBefore = await page.$$('#wl_post .wl_replies ._post');
		const postsCountBefore = postsBefore.length;

		await page.click(`#reply_button${postId}`);

		await page.waitFor(
			beforeCount => {
				const currentCount = document.querySelectorAll('#wl_post .wl_replies ._post')
					.length;
				return currentCount > beforeCount;
			},
			{},
			postsCountBefore,
		);

		await page.waitFor(1000);
		const currentUserHref = await page.evaluate(
			() => document.querySelector(`._post_field_author`).href,
		);

		const userCommentIds = await page.evaluate(
			userHref =>
				[...document.querySelectorAll('#wl_post .wl_replies ._post')]
					.filter(element => element.querySelector('a.reply_image').href === userHref)
					.map(element => element.getAttribute('data-post-id')),
			currentUserHref,
		);

		const newCommentId = maxBy(userCommentIds, id => parseInt(id.replace(/.*_/, ''), 10));
		return { commentId: newCommentId };
	}
}

export default WallCheckBanResponse;
