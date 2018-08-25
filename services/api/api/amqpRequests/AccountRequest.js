import Request from '../../../../lib/amqp/Request';

class AccountRequest extends Request {
	constructor(config, args) {
		const queue   = config.get('accountTask.queue');
		const timeout = config.get('accountTask.timeout');
		const method  = 'getAccount';
		super({
			args,
			queue,
			method,
			timeout,
		});
	}
}

export default AccountRequest;
