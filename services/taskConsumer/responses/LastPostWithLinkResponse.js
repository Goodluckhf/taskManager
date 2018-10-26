import cheerio  from 'cheerio';
import axios    from 'axios';
import bluebird  from 'bluebird';
import Response from '../../../lib/amqp/Response';
import { getRandom } from '../../../lib/helper';

const cleanLink = (link) => {
	return link.replace(/^(?:https?:\/\/)?(?:www\.)?/, '');
};

const parseLink = (link) => {
	if (!/^\/away\.php\?/.test(link)) {
		return cleanLink(link);
	}
	
	const matches = link.match(/to=(.+?)&/);
	if (!matches[1]) {
		return cleanLink(link);
	}
	
	return cleanLink(decodeURIComponent(matches[1]));
};

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
				method : 'get',
				timeout: 5000,
				headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:47.0) Gecko/20100101 Firefox/47.0' },
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
		const $ = await this.getHtml(groupLink);
		const $lastPost = $('#page_wall_posts .post').eq(0);
		if (!$lastPost.length) {
			throw new Error('Группа пустая');
		}
		
		const $mentionLink = $lastPost.find('a.mem_link');
		const $postId      = $lastPost.attr('data-post-id');
		
		const result = {
			postId: $postId,
		};
		
		if ($mentionLink.length) {
			const mentionId  = $mentionLink.attr('mention_id');
			result.mentionId = mentionId;
		} else {
			const anyLink = $lastPost.find('.wall_post_text a:not(.wall_post_more)').eq(0);
			if (anyLink.length && anyLink.attr('href')) {
				if (/vk\.cc/.test(anyLink.text())) {
					result.link = parseLink(anyLink.text());
				} else {
					result.link = parseLink(anyLink.attr('href'));
				}
			}
		}
		
		return result;
	}
}

export default LastPostWithLinkResponse;
