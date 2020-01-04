import { AbstractRpcRequest } from '../../../lib/amqp/abstract-rpc-request';
import { PostCommentArgInterface } from './post-comment-arg.interface';

export class PostCommentRpcRequest extends AbstractRpcRequest {
	protected readonly method = 'postComment';

	protected readonly retriesLimit = 4;

	setArguments(args: PostCommentArgInterface) {
		this.args = args;
	}
}
