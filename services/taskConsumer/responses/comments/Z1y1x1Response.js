import axios    from 'axios';
import Response from '../../../../lib/amqp/Response';

class Z1y1x1Response extends Response {
	/**
	 * @return {String}
	 */
	// eslint-disable-next-line class-methods-use-this,
	get method() {
		return 'setComments_z1y1x1';
	}
	
	async process({ postLink, commentsCount, serviceCredentials: { token } }) {
		this.logger.info({
			mark   : 'comments',
			service: 'z1y1x1',
			message: 'Начало выполения',
			postLink,
			commentsCount,
			token,
		});
		
		const { data } = await axios.get('http://api.z1y1x1.ru/tasks/create', {
			params: {
				token,
				sub    : 3,
				type   : 2,
				content: postLink,
				count  : commentsCount,
			},
		});
		
		this.logger.info({
			mark   : 'comments',
			service: 'z1y1x1',
			message: 'ответ от сервиса',
			postLink,
			commentsCount,
			token,
			data,
		});
		
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
