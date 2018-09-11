import axios from 'axios';
import Response  from '../../lib/amqp/Response';

/**
 * @property {String} token
 */
class CommentsResponse extends Response {
	constructor({ token, ...args }) {
		super(args);
		this.token = token;
	}
	
	//eslint-disable-next-line
	async process(method, { postLink, count }) {
		const { data: result } = axios.get('http://api.z1y1x1.ru/tasks/create', {
			params: {
				sub    : 3,
				type   : 2,
				token  : this.token,
				content: postLink,
				count,
			},
		});
		
		this.logger.info(result);
		
		return result;
	}
}

export default CommentsResponse;
