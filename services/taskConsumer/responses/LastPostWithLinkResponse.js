import { JSDOM } from 'jsdom';
import Response  from '../../../lib/amqp/Response';

const cleanLink = (link) => {
	return link.replace(/^(?:https?:\/\/)?(?:www\.)?/, '');
};

const parseLink = (link) => {
	if (!/vk\.com\/away\.php\?/.test(link)) {
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
		const jsDom = await JSDOM.fromURL(groupLink);
		
		const $lastPost = jsDom.window.document.querySelectorAll('#page_wall_posts .post')[0];
		if (!$lastPost) {
			throw new Error('Группа пустая');
		}
		
		const $mentionLink = $lastPost.querySelector('a.mem_link');
		const $postId      = $lastPost.attributes.getNamedItem('data-post-id');
		
		const result = {
			postId: $postId.value,
		};
		
		if ($mentionLink) {
			const mentionId  = $mentionLink.attributes.getNamedItem('mention_id');
			result.mentionId = mentionId.value;
		} else {
			const anyLink = $lastPost.querySelector('.wall_text a:not(.wall_post_more)');
			if (anyLink) {
				result.link = parseLink(anyLink.href);
			}
		}
		
		return result;
	}
}

export default LastPostWithLinkResponse;
