import axios    from 'axios/index';
import Response from '../../../../lib/amqp/Response';

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
		return 'setLikes_z1y1x1';
	}
	
	async process({ postLink, likesCount }) {
		this.logger.info({ postLink, likesCount });
		const { data } = await axios.get('http://api.z1y1x1.ru/tasks/create', {
			params: {
				type   : 1,
				token  : this.token,
				content: postLink,
				count  : likesCount,
			},
		});
		
		this.logger.info({ postLink, likesCount, data });
		
		return data;
	}
}

export default Z1y1x1Response;
