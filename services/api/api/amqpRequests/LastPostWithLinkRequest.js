import Request from '../../../../lib/amqp/Request';

class LastPostWithLinkRequest extends Request {
	constructor(config, args) {
		const queue   = config.get('tasksQueue.name');
		const timeout = config.get('tasksQueue.timeout');
		const method  = 'getLastPostWithLink';
		super({
			args,
			queue,
			method,
			timeout,
		});
	}
}

export default LastPostWithLinkRequest;