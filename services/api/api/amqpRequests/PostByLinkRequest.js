import Request from '../../../../lib/amqp/Request';

class PostByLinkRequest extends Request {
	constructor(config, args) {
		const queue = config.get('tasksQueue.name');
		const timeout = config.get('tasksQueue.timeout');
		const method = 'postByLink';
		super({
			args,
			queue,
			method,
			timeout,
		});
	}
}

export default PostByLinkRequest;
