import { JSDOM } from 'jsdom';
import Response  from '../../../lib/amqp/Response';

class PostCheckAdResponse extends Response {
	/**
	 * @return {String}
	 */
	// eslint-disable-next-line class-methods-use-this,
	get method() {
		return 'postCheckAd';
	}
	
	async process({ postLink, targetPublics }) {
		this.logger.info({ postLink, targetPublics });
		
		const jsDom = await JSDOM.fromURL(postLink);
		
		const $lastPost    = jsDom.window.document.querySelectorAll('#page_wall_posts .post')[0];
		const $mentionLink = $lastPost.querySelector('a.mem_link');
		if (!$mentionLink) {
			throw new Error('There is no ad post');
		}
		
		//Для сылки на пост
		const $postId   = $lastPost.attributes.getNamedItem('data-post-id');
		const mentionId = $mentionLink.attributes.getNamedItem('mention_id');
		
		const hasTargetGroupInTask = targetPublics.some(targetGroup => (
			`club${targetGroup}` === mentionId.value
		));
		
		if (!hasTargetGroupInTask) {
			throw new Error('There is no ad post');
		}
		
		return $postId.value;
	}
}

export default PostCheckAdResponse;
