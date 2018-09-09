import Request from '../../../../lib/amqp/Request';

class LikeRequest extends Request {
	constructor(config, args) {
		const queue   = config.get('autoLikesTask.queue');
		const timeout = config.get('autoLikesTask.timeout');
		const method  = 'setLikes';
		super({
			args,
			queue,
			method,
			timeout,
		});
	}
}

export default LikeRequest;
