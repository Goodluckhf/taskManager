import { inject, injectable } from 'inversify';
import { ConfigInterface } from '../../../config/config.interface';
import RpcClient from '../../../lib/amqp/rpc-client';
import { LoggerInterface } from '../../../lib/logger.interface';
import { PostCommentRpcRequest } from './post-comment-rpc.request';
import { RpcRequestFactory } from '../../../lib/amqp/rpc-request.factory';
import { PostCommentArgInterface } from './post-comment-arg.interface';
import { PostCommentResponse } from './post-comment.response';
import { VkUserService } from '../vk-users/vk-user.service';

@injectable()
export class CommentService {
	constructor(
		@inject('Config') private readonly config: ConfigInterface,
		@inject(RpcClient) private readonly rpcClient: RpcClient,
		@inject('Logger') private readonly logger: LoggerInterface,
		@inject(RpcRequestFactory) private readonly rpcRequestFactory: RpcRequestFactory,
		@inject(VkUserService) private readonly vkUserService: VkUserService,
	) {}

	async postComment(args: PostCommentArgInterface): Promise<PostCommentResponse> {
		const rpcRequest = this.rpcRequestFactory.create(PostCommentRpcRequest);
		rpcRequest.setArguments(args);
		try {
			const response = await this.rpcClient.call<PostCommentResponse>(rpcRequest);
			await this.vkUserService.updateSession(args.credentials.login, response.remixsid);
			return response;
		} catch (error) {
			this.logger.error({
				mark: 'setComments',
				traceId: rpcRequest.getId(),
				arguments: args,
				error,
			});
			throw error;
		}
	}
}
