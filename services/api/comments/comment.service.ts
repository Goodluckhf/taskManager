import { inject, injectable } from 'inversify';
import PostCommentRequest from '../api/amqpRequests/PostCommentRequest';
import { ConfigInterface } from '../../../config/config.interface';
import RpcClient from '../../../lib/amqp/RpcClient';
import { LoggerInterface } from '../../../lib/logger.interface';

@injectable()
export class CommentService {
	constructor(
		@inject('Config') private readonly config: ConfigInterface,
		@inject(RpcClient) private readonly rpcClient: RpcClient,
		@inject('Logger') private readonly logger: LoggerInterface,
	) {}

	async create(args) {
		const request = new PostCommentRequest(this.config, args);
		try {
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			return await this.rpcClient.call(request);
		} catch (error) {
			this.logger.error({
				mark: 'setComments',
				arguments: args,
				error,
			});
			throw error;
		}
	}
}
