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

let processing     = false;
let needToShutDown = false;

/**
 * @param {Number} ms,
 * @param {Number} code
 */
const forceExit = (ms = 500, code = 1) => {
	setTimeout(() => {
		process.exit(code);
	}, ms);
};


class TaskResponse extends Response {
	async process(method, data) {
		processing = true;
		this.logger.info({
			message: 'receive method',
			method,
			data,
		});
		
		await bluebird.delay(2000);
		
		if (needToShutDown) {
			forceExit(500, 2);
		}
		
		processing = false;
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

process.on('SIGUSR1', () => {
	logger.warn('usr1');
});

process.on('SIGHUP', () => {
	logger.warn('SIGHUP');
});

process.on('SIGUSR2', () => {
	logger.warn('usr2');
});

process.on('SIGINT', () => {
	logger.warn('int');
});

process.on('SIGTERM', () => {
	logger.warn({ message: 'Graceful shutdown' });
	if (!processing) {
		forceExit(500, 2);
		return;
	}
	
	needToShutDown = true;
});

process.on('uncaughtException', (error) => {
	logger.error({ error });
	forceExit();
});

process.on('unhandledRejection', (error) => {
	logger.error({ error });
	forceExit();
});
