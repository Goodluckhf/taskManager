import Request from '../../../../lib/amqp/Request';

class CommentRequest extends Request {
	constructor(config, args) {
		const queue   = config.get('commentsTask.queue');
		const timeout = config.get('commentsTask.timeout');
		const method  = 'setComments';
		super({
			args,
			queue,
			method,
			timeout,
		});
	}
}

export default CommentRequest;
