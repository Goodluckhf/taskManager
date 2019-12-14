import Request from '../../../../lib/amqp/Request';

class CheckVkUserRequest extends Request {
	constructor(config, args) {
		const queue = config.get('tasksQueue.name');
		const timeout = config.get('tasksQueue.timeout');
		const retriesLimit = config.get('checkVkUserTask.retriesLimit');
		const method = 'checkVkUser';
		super({
			args,
			queue,
			method,
			timeout,
			retriesLimit,
		});
	}
}

export default CheckVkUserRequest;
