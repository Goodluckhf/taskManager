import Request from '../../../../lib/amqp/Request';

class RepostRequest extends Request {
	constructor(service, config, args) {
		const queue = config.get('tasksQueue.name');
		const timeout = config.get('tasksQueue.timeout');
		const method = `setReposts_${service}`;
		super({
			args,
			queue,
			method,
			timeout,
		});
	}
}

export default RepostRequest;
