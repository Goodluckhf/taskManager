import axios    from 'axios/index';
import Response from '../../../../lib/amqp/Response';

class Z1y1x1Response extends Response {
	/**
	 * @return {String}
	 */
	// eslint-disable-next-line class-methods-use-this,
	get method() {
		return 'setLikes_z1y1x1';
	}
	
	async process({ postLink, likesCount, serviceCredentials: { token } }) {
		this.logger.info({ postLink, likesCount });
		const { data } = await axios.get('http://api.z1y1x1.ru/tasks/create', {
			params: {
				token,
				type   : 1,
				content: postLink,
				count  : likesCount,
			},
		});
		
		this.logger.info({ postLink, likesCount, data });
		
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
