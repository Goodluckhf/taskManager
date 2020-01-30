import { maxBy } from 'lodash';
import { inject, injectable } from 'inversify';
import { Browser } from 'puppeteer';
import { createBrowserPage } from '../actions/create-page';
import { AbstractRpcHandler } from '../../../lib/amqp/abstract-rpc-handler';
import { LoggerInterface } from '../../../lib/logger.interface';
import { AccountException } from './account.exception';
import { VkAuthorizer } from '../actions/vk/vk-authorizer';
import { CommentsClosedException } from './comments-closed.exception';

@injectable()
export class PostCommentRpcHandler extends AbstractRpcHandler {
	@inject('Logger') private readonly logger: LoggerInterface;

	@inject(VkAuthorizer) private readonly vkAuthorizer: VkAuthorizer;

	protected readonly method = 'postComment';

	async handle({ credentials: { login, password, proxy }, postLink, text, imageURL, replyTo }) {
		this.logger.info({
			message: 'Задача на коменты',
			credentials: { login, password, proxy },
			postLink,
			text,
			imageURL,
			replyTo,
		});

		let canRetry = true;
		let browser: Browser = null;
		try {
			const { page, browser: _browser } = await createBrowserPage(proxy);
			browser = _browser;

			await this.vkAuthorizer.authorize(page, {
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

				document.querySelector<HTMLElement>('.box_x_button').click();
			});

			let postId = postLink
				.replace(/.*[?&]w=wall-/, '-')
				.replace(/.*vk.com\/wall-/, '-')
				.replace(/&.*$/, '');

			this.logger.info({
				message: 'Спарсили ссылку на пост',
				postId,
			});

			await this.withCatchingClosedComments(
				async () => {
					await page.click('.reply_fakebox');
				},
				login,
				postLink,
			);

			if (replyTo) {
				postId = replyTo;
				await this.withCatchingClosedComments(
					async () => {
						await page.evaluate(selector => {
							document.querySelector(selector).click();
						}, `#post${postId} a.reply_link`);
					},
					login,
					postLink,
				);

				postId = await page.evaluate(_postId => {
					const parent = document.querySelector(`#post${_postId}`).parentElement;
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
				await page.waitForSelector(`.reply_form img.page_preview_photo`);

				// Удаляем из текста ссылку
				await page.evaluate(
					(_text, _postId) => {
						document.querySelector<HTMLElement>(
							`#reply_field${_postId}`,
						).innerText = _text;
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
				() => document.querySelector<HTMLAnchorElement>(`._post_field_author`).href,
			);

			const postsCountBefore = await page.evaluate(
				userHref =>
					[...document.querySelectorAll<HTMLElement>('._post.reply')].filter(element => {
						const imageElement = element.querySelector<HTMLAnchorElement>(
							'a.reply_image',
						);

						if (!imageElement) {
							return false;
						}

						return imageElement.href === userHref;
					}).length,
				currentUserHref,
			);

			const lastPostId = await page.evaluate(() => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
				// @ts-ignore
				const posts = [...document.querySelectorAll<HTMLElement>('._post.reply')];
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

			await page.waitFor(
				(beforeCount, userHref, _lastPostId) => {
					const phoneConfirmationForm = document.querySelector('#validation_phone_row');

					if (phoneConfirmationForm) {
						return true;
					}

					// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
					// @ts-ignore
					const currentUserPosts = [...document.querySelectorAll('._post.reply')].filter(
						element => {
							const imageElement = element.querySelector<HTMLAnchorElement>(
								'a.reply_image',
							);

							if (!imageElement) {
								return false;
							}

							return imageElement.href === userHref;
						},
					);

					// в вк сначала ставится такой id "0_-1"
					// А потом с сервера приходит корректный
					const everyPostsHasId = currentUserPosts.every(
						element => element.getAttribute('data-post-id') !== '0_-1',
					);

					// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
					// @ts-ignore
					const posts = [...document.querySelectorAll<HTMLElement>('._post.reply')];
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

			// После нажатия на опубликовать коммент
			// Нельзя заново запускать задачу
			canRetry = false;

			const needPhoneConfirmation = await page.evaluate(() => {
				const form = document.querySelector('#validation_phone_row');
				return !!form;
			});

			if (needPhoneConfirmation) {
				throw new AccountException(
					'Account requires phone confirmation',
					'phone_required',
					login,
					false,
				);
			}

			const userCommentIds: string[] = await page.evaluate(
				userHref =>
					// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
					// @ts-ignore
					[...document.querySelectorAll<HTMLElement>('._post.reply')]
						.filter(element => {
							const imageElement = element.querySelector<HTMLAnchorElement>(
								'a.reply_image',
							);

							if (!imageElement) {
								return false;
							}

							return imageElement.href === userHref;
						})
						.map(element => element.getAttribute('data-post-id')),
				currentUserHref,
			);

			const newCommentId = maxBy(userCommentIds, id => parseInt(id.replace(/.*_/, ''), 10));
			if (!newCommentId) {
				this.logger.error({
					message: 'new comment id is undefined',
					userCommentIds,
					postLink,
					text,
					login,
				});

				throw new Error('Unexpected lost new comment id');
			}
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

	private async withCatchingClosedComments(func: Function, login: string, postLink: string) {
		try {
			await func();
		} catch (error) {
			this.logger.warn({
				message: 'ошибка при клике на "ответить"',
				postLink,
				login,
				error,
			});
			throw new CommentsClosedException(login, postLink);
		}
	}
}
