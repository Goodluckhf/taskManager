import Request from '../../../../lib/amqp/Request';

class PostCommentRequest extends Request {
	constructor(config, args) {
		const queue = config.get('tasksQueue.name');
		const timeout = config.get('tasksQueue.timeout');
		const retriesLimit = config.get('postCommentsTask.retriesLimit');
		const method = 'postComment';
		super({
			args,
			queue,
			method,
			timeout,
			retriesLimit,
		});
	}
}

export default PostCommentRequest;
