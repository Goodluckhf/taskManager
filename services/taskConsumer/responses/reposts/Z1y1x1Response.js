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
		return 'setReposts_z1y1x1';
	}
	
	async process({ postLink, repostsCount }) {
		this.logger.info({ postLink, repostsCount });
		const { data } = await axios.get('http://api.z1y1x1.ru/tasks/create', {
			params: {
				type   : 3,
				token  : this.token,
				content: postLink,
				count  : repostsCount,
			},
		});
		
		this.logger.info({ postLink, repostsCount, data });
		
		if (data.error) {
			throw data.error;
		}
		
		return data;
	}
}

export default Z1y1x1Response;
