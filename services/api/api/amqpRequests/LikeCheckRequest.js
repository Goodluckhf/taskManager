import Request from '../../../../lib/amqp/Request';

class LikeCheckRequest extends Request {
	constructor(config, args) {
		const queue = config.get('tasksQueue.name');
		const timeout = config.get('tasksQueue.timeout');
		const method = 'checkLikes';
		super({
			args,
			queue,
			method,
			timeout,
		});
	}
}

export default LikeCheckRequest;
