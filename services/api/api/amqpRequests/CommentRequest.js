import Request from '../../../../lib/amqp/Request';

class CommentRequest extends Request {
	constructor(config, args) {
		const queue   = config.get('tasksQueue.name');
		const timeout = config.get('tasksQueue.timeout');
		const method  = config.get('commentsTask.method');
		super({
			args,
			queue,
			method,
			timeout,
		});
	}
}

export default CommentRequest;
