import Request from '../../../../lib/amqp/Request';

class RepostCheckRequest extends Request {
	constructor(config, args) {
		const queue   = config.get('tasksQueue.name');
		const timeout = config.get('tasksQueue.timeout');
		const method  = 'checkReposts';
		super({
			args,
			queue,
			method,
			timeout,
		});
	}
}

export default RepostCheckRequest;
