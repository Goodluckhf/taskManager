import Response from '../../../lib/amqp/Response';
import { postIdByLink } from '../../../lib/helper';

/**
 * @property {String} token
 * @property {VkApi} vkApi
 */
class PostByLinkResponse extends Response {
	constructor({ vkApi, ...args }) {
		super(args);
		this.vkApi = vkApi;
	}

	/**
	 * @return {String}
	 */
	// eslint-disable-next-line class-methods-use-this,
	get method() {
		return 'postByLink';
	}

	async process({ postLink }) {
		this.logger.info({ postLink });
		const postId = postIdByLink(postLink);
		const {
			response: [post],
		} = await this.vkApi.apiRequest('wall.getById', {
			posts: postId,
			copy_history_depth: 1,
		});

		return {
			comments: post.comments.count,
			likes: post.likes.count,
			reposts: post.reposts.count,
		};
	}
}

export default PostByLinkResponse;
