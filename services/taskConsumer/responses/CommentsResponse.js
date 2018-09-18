import axios    from 'axios';
import Response from '../../../lib/amqp/Response';

/**
 * @property {String} token
 */
class CommentsResponse extends Response {
	constructor({ token, ...args }) {
		super(args);
		this.token = token;
	}
	
	async process({ postLink, commentsCount }) {
		this.logger.info({ postLink, commentsCount });
		const { data } = await axios.get('http://api.z1y1x1.ru/tasks/create', {
			params: {
				sub    : 3,
				type   : 2,
				token  : this.token,
				content: postLink,
				count  : commentsCount,
			},
		});
		
		this.logger.info({ postLink, commentsCount, data });
		
		return data;
	}
}

export default CommentsResponse;
