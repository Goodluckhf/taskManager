import axios from 'axios';

const axiosInstance = axios.create();
class LikeService {
	constructor(config, logger) {
		this.config = config;
		this.logger = logger;
	}

	async setLikesToComment({ count, url }) {
		this.logger.info({
			message: 'Отправляю задачу на лайки',
			count,
			url,
		});
		const { data } = await axiosInstance.get('http://api.z1y1x1.ru/tasks/create', {
			params: {
				token: this.config.get('z1y1x1.token'),
				type: 5,
				content: url,
				count,
			},
			timeout: this.config.get('z1y1x1.timeout'),
		});

		this.logger.info({
			message: 'Ответ от сервиса z1x1',
			count,
			url,
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

export default LikeService;
