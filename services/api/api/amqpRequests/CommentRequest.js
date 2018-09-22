import Request from '../../../../lib/amqp/Request';

class CommentRequest extends Request {
	constructor(service, config, args) {
		const queue   = config.get('tasksQueue.name');
		const timeout = config.get('tasksQueue.timeout');
		const method  = `setComments_${service}`;
		super({
			args,
			queue,
			method,
			timeout,
		});
	}
}

export default CommentRequest;
