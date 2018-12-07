import Response from '../../../lib/amqp/Response';
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
		const {
			response: [post],
		} = await this.vkApi.apiRequest('wall.getById', {
			posts: postId,
			copy_history_depth: 1,
		});

		if (post.likes.count < likesCount) {
			throw new Error('Лайки не накрутились');
		}
	}
}

export default LikesCheckResponse;
