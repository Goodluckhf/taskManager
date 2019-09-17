import cheerio from 'cheerio';
import axios from 'axios';
import bluebird from 'bluebird';
import Response from '../../../lib/amqp/Response';
import { getRandom, cleanLink } from '../../../lib/helper';

class LastPostWithLinkResponse extends Response {
	/**
	 * @return {String}
	 */
	// eslint-disable-next-line class-methods-use-this,
	get method() {
		return 'getLastPostWithLink';
	}

	async getHtml(url) {
		try {
			const { data } = await axios({
				url,
				method: 'get',
				timeout: 6000,
				headers: {
					'User-Agent':
						'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:47.0) Gecko/20100101 Firefox/47.0',
				},
			});
			const $ = cheerio.load(data);
			const fastError = $('.message_page_body');
			if (fastError.length) {
				await bluebird.delay(getRandom(500, 3000));
				return this.getHtml(url);
			}

			return $;
		} catch (_error) {
			const error = _error;
			if (error.request) {
				delete error.request;
			}

			if (error.response && error.response.request) {
				delete error.response.request;
			}
			throw error;
		}
	}

	//eslint-disable-next-line class-methods-use-this
	async process({ groupLink }) {
		// Пока такой retry
		const $ = await this.getHtml(groupLink)
			.catch(() => this.getHtml(groupLink))
			.catch(() => this.getHtml(groupLink))
			.catch(() => this.getHtml(groupLink));

		const $lastPost = $('#page_wall_posts .post').eq(0);
		if (!$lastPost.length) {
			throw new Error('Группа пустая');
		}

		const $mentionLink = $lastPost.find('a.mem_link');
		const $postId = $lastPost.attr('data-post-id');

		const result = {
			postId: $postId,
		};

		if ($mentionLink.length) {
			const mentionId = $mentionLink.attr('mention_id');
			result.mentionId = mentionId;
		} else {
			const anyLink = $lastPost.find('.wall_post_text a:not(.wall_post_more)').eq(0);
			if (anyLink.length && anyLink.attr('href')) {
				if (/vk\.cc/.test(anyLink.text())) {
					result.link = cleanLink(anyLink.text());
				} else {
					// Для кирилических ссылок vk в href выдают подную чушь
					// Поэтому берем из текста ссылки
					// Если что-то не так
					try {
						result.link = cleanLink(anyLink.attr('href'));
					} catch (error) {
						this.logger.warn({
							error,
							groupLink,
							link: anyLink.attr('href'),
							linkText: anyLink.text(),
						});

						result.link = cleanLink(anyLink.text());
					}
				}
			}
		}

		const hasRepost = await $lastPost.find('.copy_quote');
		result.hasRepost = !!hasRepost.length;

		return result;
	}
}

export default LastPostWithLinkResponse;
