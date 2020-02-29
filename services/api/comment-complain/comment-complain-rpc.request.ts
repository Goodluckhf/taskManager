import { AbstractRpcRequest } from '../../../lib/amqp/abstract-rpc-request';
import { CommentComplainRpcArgsInterface } from './comment-complain-rpc-args.interface';

export class CommentComplainRpcRequest extends AbstractRpcRequest {
	protected readonly method = 'complain_post';

	protected readonly retriesLimit = 2;

	setArguments(args: CommentComplainRpcArgsInterface) {
		this.args = args;
	}
}
