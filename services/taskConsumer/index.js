import config    from 'config';
import bluebird  from 'bluebird';

import Amqp      from '../../lib/amqp/Amqp';
import logger    from '../../lib/logger';
import RpcServer from '../../lib/amqp/RpcServer';
import Response  from '../../lib/amqp/Response';

const rabbitConfig = config.get('rabbit');
const amqp = new Amqp(logger, {
	...rabbitConfig,
	retry: false,
});

class TaskResponse extends Response {
	async process(method, data) {
		this.logger.info({
			message: 'receive method',
			method,
			data,
		});
		
		await bluebird.delay(5000);
		return {
			testValue: Math.random(),
		};
	}
}

const response = new TaskResponse(logger, {
	queue   : config.get('taskQueue.name'),
	prefetch: config.get('taskQueue.prefetch'),
});

const rpcServer = new RpcServer(amqp, logger, response);

/**
 * @param {Number} ms,
 * @param {Number} code
 */
const forceExit = (ms = 500, code = 1) => {
	setTimeout(() => {
		process.exit(code);
	}, ms);
};

(async () => {
	try {
		await rpcServer.start();
		logger.info({
			message: 'rpc server started',
			queue  : response.queue,
		});
	} catch (error) {
		logger.error({ error });
		forceExit();
	}
})();

process.on('uncaughtException', (error) => {
	logger.error({ error });
	forceExit();
});

process.on('unhandledRejection', (error) => {
	logger.error({ error });
	forceExit();
});
