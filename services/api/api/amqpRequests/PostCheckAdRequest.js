import Request from '../../../../lib/amqp/Request';

class PostCheckAdRequest extends Request {
	constructor(config, args) {
		const queue   = config.get('tasksQueue.name');
		const timeout = config.get('tasksQueue.timeout');
		const method  = 'postCheckAd';
		super({
			args,
			queue,
			method,
			timeout,
		});
	}
}

export default PostCheckAdRequest;
