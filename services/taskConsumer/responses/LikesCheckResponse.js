import Response         from '../../../lib/amqp/Response';
import { postIdByLink } from '../../../lib/helper';

/**
 * @property {String} token
 * @property {VkApi} vkApi
 */
class LikesCheckResponse extends Response {
	constructor({ vkApi, ...args }) {
		super(args);
		this.vkApi = vkApi;
	}
	
	/**
	 * @return {String}
	 */
	// eslint-disable-next-line class-methods-use-this,
	get method() {
		return 'checkLikes';
	}
	
	async process({ postLink, likesCount }) {
		this.logger.info({ postLink, likesCount });
		const postId = postIdByLink(postLink);
		const { response: [post] } = await this.vkApi.apiRequest('wall.getById', {
			posts             : postId,
			copy_history_depth: 1,
		});
		
		if (post.likes.count < likesCount) {
			const error = new Error('there is not likes');
			error.likesCount = post.likes.count;
			error.postLink   = postLink;
			throw error;
		}
	}
}

export default LikesCheckResponse;
