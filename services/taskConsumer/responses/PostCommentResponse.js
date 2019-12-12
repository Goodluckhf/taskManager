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
			'--disable-accelerated-2d-canvas',
			'--disable-gpu',
		];
		if (proxy) {
			puppeteerArgs.push(`--proxy-server=${proxy.url}`);
		}

		this.logger.info({
			message: 'Задача на коменты',
			credentials: { login, password },
			postLink,
			text,
			imageURL,
			replyTo,
			proxy,
		});

		let canRetry = true;
		/**
		 * @type {Browser}
		 */
		let browser = null;
		try {
			browser = await puppeteer.launch({
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

			const loginFailedElement = await page.$('#login_message');
			if (loginFailedElement) {
				canRetry = false;

				const error = new Error('Account credentials is invalid');
				error.login = login;
				error.code = 'login_failed';
				throw error;
			}

			const blockedElement = await page.$('#login_blocked_wrap');
			if (blockedElement) {
				canRetry = false;

				const error = new Error('Account is blocked');
				error.login = login;
				error.code = 'blocked';
				throw error;
			}

			await page.goto(postLink, {
				waitUntil: 'networkidle2',
			});

			this.logger.info({
				message: 'аккаунт vk жив (Перешли на страницу поста)',
				login,
			});

			await page.waitFor(500);
			await page.evaluate(() => {
				const notifyBox = document.querySelector('#box_layer #actualize_controls');
				if (!notifyBox) {
					return;
				}

				document.querySelector('.box_x_button').click();
			});

			let postId = postLink
				.replace(/.*[?&]w=wall-/, '-')
				.replace(/.*vk.com\/wall-/, '-')
				.replace(/&.*$/, '');

			this.logger.info({
				message: 'Спарсили ссылку на пост',
				postId,
			});

			await page.click('.reply_fakebox');

			if (replyTo) {
				postId = replyTo;
				await page.evaluate(selector => {
					document.querySelector(selector).click();
				}, `#post${postId}`);
				postId = await page.evaluate(_postId => {
					const parent = document.querySelector(`#post${_postId}`).parentNode;
					if (parent.className === 'replies_list_deep') {
						return parent.getAttribute('id').replace('replies', '');
					}

					return _postId;
				}, postId);
			}

			this.logger.info({
				message: 'postId после применеия replyTo',
				postLink,
				postId,
			});

			const input = await page.$(`#reply_field${postId}`);
			await input.type(` ${text}`);

			if (imageURL) {
				this.logger.info({
					message: 'Добавляем картинку',
					imageURL,
					postId,
				});

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

				this.logger.info({
					message: 'Дождались загрузки картинки',
					imageURL,
					postId,
				});
			}

			const currentUserHref = await page.evaluate(
				() => document.querySelector(`._post_field_author`).href,
			);

			const postsCountBefore = await page.evaluate(
				userHref =>
					[...document.querySelectorAll('._post.reply')].filter(
						element => element.querySelector('a.reply_image').href === userHref,
					).length,
				currentUserHref,
			);

			const lastPostId = await page.evaluate(() => {
				const posts = [...document.querySelectorAll('._post.reply')];
				if (!posts.length) {
					return null;
				}
				return posts[posts.length - 1].getAttribute('data-post-id');
			});

			// Кнопка может быть под кнопкой другой
			// поэтому эмулирем через js
			await page.evaluate(selector => {
				document.querySelector(selector).click();
			}, `#reply_button${postId}`);

			// После нажатия на опубликовать коммент
			// Нельзя заново запускать задачу
			canRetry = false;
			await page.waitFor(
				(beforeCount, userHref, _lastPostId) => {
					const currentUserPosts = [...document.querySelectorAll('._post.reply')].filter(
						element => element.querySelector('a.reply_image').href === userHref,
					);

					// в вк сначала ставится такой id "0_-1"
					// А потом с сервера приходит корректный
					const everyPostsHasId = currentUserPosts.every(
						element => element.getAttribute('data-post-id') !== '0_-1',
					);

					const posts = [...document.querySelectorAll('._post.reply')];
					if (!posts.length) {
						return false;
					}
					const currentLastPostId = posts[posts.length - 1].getAttribute('data-post-id');
					// Коментов может стать меньше
					// Потому как ответы скрываются
					return (
						(currentUserPosts.length !== beforeCount ||
							currentLastPostId !== _lastPostId) &&
						everyPostsHasId
					);
				},
				{},
				postsCountBefore,
				currentUserHref,
				lastPostId,
			);

			const userCommentIds = await page.evaluate(
				userHref =>
					[...document.querySelectorAll('._post.reply')]
						.filter(element => element.querySelector('a.reply_image').href === userHref)
						.map(element => element.getAttribute('data-post-id')),
				currentUserHref,
			);

			const newCommentId = maxBy(userCommentIds, id => parseInt(id.replace(/.*_/, ''), 10));
			return { commentId: newCommentId };
		} catch (error) {
			error.canRetry = canRetry;
			throw error;
		} finally {
			if (browser) {
				await browser.close();
			}
		}
	}
}

export default WallCheckBanResponse;
