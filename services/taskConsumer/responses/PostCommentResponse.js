import { maxBy } from 'lodash';
import Response from '../../../lib/amqp/Response';
import { createBrowserPage } from '../actions/createPage';
import { authorize } from '../actions/vk/authorize';

/**
 * @property {VkApi} vkApi
 */
class PostCommentResponse extends Response {
	/**
	 * @return {String}
	 */
	// eslint-disable-next-line class-methods-use-this,
	get method() {
		return 'postComment';
	}

	async process({ credentials: { login, password }, postLink, text, imageURL, replyTo, proxy }) {
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
			const { page, browser: _browser } = await createBrowserPage(proxy);
			browser = _browser;

			await authorize(page, this.logger, {
				login,
				password,
				proxy,
			});

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
				}, `#post${postId} a.reply_link`);
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
			error.canRetry = typeof error.canRetry !== 'undefined' ? error.canRetry : canRetry;
			throw error;
		} finally {
			if (browser) {
				await browser.close();
			}
		}
	}
}

export default PostCommentResponse;
