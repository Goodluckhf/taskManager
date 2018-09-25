import Request from '../../../../lib/amqp/Request';

class CheckWallBanRequest extends Request {
	constructor(config, args) {
		const queue   = config.get('tasksQueue.name');
		const timeout = config.get('tasksQueue.timeout');
		const method  = 'checkWallBan';
		super({
			args,
			queue,
			method,
			timeout,
		});
	}
}

export default CheckWallBanRequest;
