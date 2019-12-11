import PostCommentRequest from '../api/amqpRequests/PostCommentRequest';

class CommentsService {
	constructor(config, rpcClient, logger) {
		this.config = config;
		this.rpcClient = rpcClient;
		this.logger = logger;
	}

	async create(args) {
		const request = new PostCommentRequest(this.config, args);
		try {
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

export default CommentsService;
