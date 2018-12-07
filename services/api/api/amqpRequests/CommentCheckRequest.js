import Request from '../../../../lib/amqp/Request';

class CommentCheckRequest extends Request {
	constructor(config, args) {
		const queue = config.get('tasksQueue.name');
		const timeout = config.get('tasksQueue.timeout');
		const method = 'checkComments';
		super({
			args,
			queue,
			method,
			timeout,
		});
	}
}

export default CommentCheckRequest;
