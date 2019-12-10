import axios from 'axios';

const axiosInstance = axios.create();
class LikeService {
	constructor(config) {
		this.config = config;
	}

	async setLikesToComment({ count, url }) {
		const { data } = await axiosInstance.get('http://api.z1y1x1.ru/tasks/create', {
			params: {
				token: this.config.get('z1y1x1.token'),
				type: 5,
				content: url,
				count,
			},
			timeout: this.config.get('z1y1x1.timeout'),
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
