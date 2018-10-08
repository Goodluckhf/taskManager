import Response         from '../../../lib/amqp/Response';
import { postIdByLink } from '../../../lib/helper';

/**
 * @property {String} token
 * @property {VkApi} vkApi
 */
class RepostsCheckResponse extends Response {
	constructor({ vkApi, ...args }) {
		super(args);
		this.vkApi = vkApi;
	}
	
	/**
	 * @return {String}
	 */
	// eslint-disable-next-line class-methods-use-this,
	get method() {
		return 'checkReposts';
	}
	
	async process({ postLink, repostsCount }) {
		this.logger.info({ postLink, repostsCount });
		const postId = postIdByLink(postLink);
		const { response: [post] } = await this.vkApi.apiRequest('wall.getById', {
			posts             : postId,
			copy_history_depth: 1,
		});
		
		if (post.reposts.count < repostsCount) {
			throw new Error('Репосты не накрутились');
		}
	}
}

export default RepostsCheckResponse;
