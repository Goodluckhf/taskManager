import cheerio  from 'cheerio';
import axios    from 'axios';
import Response from '../../../lib/amqp/Response';

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
	
	//eslint-disable-next-line class-methods-use-this
	async process({ groupLink }) {
		let html;
		try {
			const { data } = await axios({
				method : 'get',
				url    : groupLink,
				timeout: 5000,
				headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:47.0) Gecko/20100101 Firefox/47.0' },
			});
			html = data;
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
		
		const $ = cheerio.load(html);
		
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
			const anyLink = $lastPost.find('.wall_text a:not(.wall_post_more)').eq(0);
			if (anyLink.length) {
				result.link = parseLink(anyLink.attr('href'));
			}
		}
		
		return result;
	}
}

export default LastPostWithLinkResponse;
