import { inject, injectable } from 'inversify';
import { AxiosInstance } from 'axios';
import { LoggerInterface } from '../../../lib/logger.interface';
import { ConfigInterface } from '../../../config/config.interface';

@injectable()
export class LikeService {
	constructor(
		@inject('Logger') private readonly logger: LoggerInterface,
		@inject('Config') private readonly config: ConfigInterface,
		@inject('Axios') private readonly axios: AxiosInstance,
	) {}

	async setLikesToComment({ count, url }: { count: number; url: string }) {
		this.logger.info({
			message: 'Отправляю задачу на лайки',
			count,
			url,
		});
		const { data } = await this.axios.get('http://api.z1y1x1.ru/tasks/create', {
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
