import axios    from 'axios/index';
import Response from '../../../../lib/amqp/Response';

class Z1y1x1Response extends Response {
	/**
	 * @return {String}
	 */
	// eslint-disable-next-line class-methods-use-this,
	get method() {
		return 'setReposts_z1y1x1';
	}
	
	async process({ postLink, repostsCount, serviceCredentials: { token } }) {
		this.logger.info({
			mark   : 'reposts',
			service: 'z1y1x1',
			message: 'Начало выполения',
			postLink,
			repostsCount,
			token,
		});
		
		const { data } = await axios.get('http://api.z1y1x1.ru/tasks/create', {
			params: {
				token,
				type   : 3,
				content: postLink,
				count  : repostsCount,
			},
			timeout: 7000,
		});
		
		this.logger.info({
			mark   : 'reposts',
			service: 'z1y1x1',
			message: 'ответ от сервиса',
			postLink,
			repostsCount,
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
