import Request from '../../../../lib/amqp/Request';

class LikeRequest extends Request {
	constructor(config, args) {
		const queue   = config.get('tasksQueue.name');
		const timeout = config.get('tasksQueue.timeout');
		const method  = config.get('likesTask.method');
		super({
			args,
			queue,
			method,
			timeout,
		});
	}
}

export default LikeRequest;
