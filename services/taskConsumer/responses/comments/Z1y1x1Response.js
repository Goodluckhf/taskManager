import axios    from 'axios';
import Response from '../../../../lib/amqp/Response';

/**
 * @property {String} token
 */
class Z1y1x1Response extends Response {
	constructor({ token, ...args }) {
		super(args);
		this.token = token;
	}
	
	/**
	 * @return {String}
	 */
	// eslint-disable-next-line class-methods-use-this,
	get method() {
		return 'setComments_z1y1x1';
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
		if (data.error) {
			if (data.error.descr) {
				throw new Error(data.error.descr);
			}
			
			throw data.error;
		}
		
		return data;
	}
}

export default Z1y1x1Response;
