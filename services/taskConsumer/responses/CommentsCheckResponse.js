import Response         from '../../../lib/amqp/Response';
import { postIdByLink } from '../../../lib/helper';

/**
 * @property {String} token
 * @property {VkApi} vkApi
 */
class CommentsCheckResponse extends Response {
	constructor({ vkApi, ...args }) {
		super(args);
		this.vkApi = vkApi;
	}
	
	/**
	 * @return {String}
	 */
	// eslint-disable-next-line class-methods-use-this,
	get method() {
		return 'checkComments';
	}
	
	async process({ postLink, commentsCount }) {
		this.logger.info({ postLink, commentsCount });
		const postId = postIdByLink(postLink);
		const { response: [post] } = await this.vkApi.apiRequest('wall.getById', {
			posts             : postId,
			copy_history_depth: 1,
		});
		
		if (post.comments.count < commentsCount) {
			throw new Error('there is not comments');
		}
	}
}

export default CommentsCheckResponse;
