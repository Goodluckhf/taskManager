import { JSDOM } from 'jsdom';
import bluebird from 'bluebird';
import _ from 'lodash';

import Response from '../../../lib/amqp/Response';
/**
 * @property {VkApi} vkApi
 */
class WallCheckBanResponse extends Response {
	constructor({ vkApi, ...args }) {
		super(args);
		this.vkApi = vkApi;
	}

	/**
	 * @return {String}
	 */
	// eslint-disable-next-line class-methods-use-this,
	get method() {
		return 'checkWallBan';
	}

	async process({ link, postCount: postCountString }) {
		const postCount = parseInt(postCountString, 10);
		this.logger.info({ link, postCount });
		const jsDom = await JSDOM.fromURL(link);
		const posts = [...jsDom.window.document.querySelectorAll('.post._post')].slice(
			0,
			postCount,
		);
		const groupBlocked = jsDom.window.document.querySelector('.groups_blocked');
		if (groupBlocked) {
			throw new Error('Group is blocked');
		}

		if (!posts.length) {
			throw new Error('Posts have been deleted');
		}

		const links = [];
		await bluebird.map(posts, async post => {
			// 1) Проверяем есть ли снипет
			// 2) Проверяем есть ли вики страница
			// 3) Берем любую ссылку из поста
			try {
				// ссылка может быть в снипете
				const thumb = post.querySelector('.page_media_thumbed_link');
				const previewLink = post.querySelector('.wall_postlink_preview_btn_label');
				if (thumb) {
					links.push(this.getThumbLink(thumb));
					return;
				}

				if (previewLink) {
					try {
						const linkFromWiki = await this.getLinkFromWiki(post);
						links.push(linkFromWiki);
						return;
					} catch (error) {
						this.logger.warn({
							message: 'failed wiki parse',
							error,
						});
						return;
					}
				}

				const a = post.querySelector('.wall_text a');
				if (!a || !a.href.length) {
					this.logger.info('Нет ссылки');
					return;
				}

				links.push(a.href);
			} catch (error) {
				this.logger.error({ error });
			}
		});

		const linkChunks = _.chunk(links, 21);
		let vkLinksResponse = [];
		await bluebird.map(linkChunks, async chunk => {
			const { response } = await this.vkApi.apiRequest('execute.checkLinks', {
				links: chunk.join(','),
			});
			vkLinksResponse = vkLinksResponse.concat(response);
		});

		const errors = vkLinksResponse.reduce((_errors, resLink) => {
			// Если что-то не то пришло в api vk
			// Вторым параметром будет false
			if (!resLink[1]) {
				this.logger.warn({
					message: 'invalid link',
					link: resLink[0],
				});
				return _errors;
			}
			if (resLink[1].status !== 'banned') {
				return _errors;
			}

			const inputLink = decodeURIComponent(resLink[0]);
			const resultLink = resLink[1].link;
			_errors.push({
				inputLink,
				resultLink,
			});
			return _errors;
		}, []);

		if (errors.length) {
			const error = new Error('link/s has been banned');
			error.links = errors;
			throw error;
		}
	}

	//eslint-disable-next-line class-methods-use-this
	async getLinkFromWiki(post) {
		const a = post.querySelector('.wall_text a.lnk');
		const jsDom = await JSDOM.fromURL(a.href);
		return jsDom.window.document.querySelector('.pages_cont a').href;
	}

	//eslint-disable-next-line class-methods-use-this
	getThumbLink(thumb) {
		return thumb.querySelector('a').href;
	}
}

export default WallCheckBanResponse;
