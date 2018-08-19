import Request from '../../../../lib/amqp/Request';

class LikeRequest extends Request {
	constructor(config, ...args) {
		const queue   = config.get('likesTask.queue');
		const timeout = config.get('likesTask.timeout');
		const method  = 'setLikes';
		super({
			...args,
			queue,
			method,
			timeout,
		});
	}
}

export default LikeRequest;
