import config    from 'config';

import Amqp          from '../../lib/amqp/Amqp';
import logger        from '../../lib/logger';
import RpcServer     from '../../lib/amqp/RpcServer';
import LikesResponse from './LikesResponse';

const rabbitConfig = config.get('rabbit');
const amqp = new Amqp(logger, {
	host : process.env.NODE_ENV === 'development' ? 'localhost' : rabbitConfig.host,
	port : rabbitConfig.port,
	retry: false,
});

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
		const response = new LikesResponse({
			logger,
			login   : config.get('likePro.login'),
			password: config.get('likePro.password'),
			queue   : config.get('autoLikesTask.queue'),
			prefetch: config.get('autoLikesTask.prefetch'),
		});
		
		const rpcServer = new RpcServer(amqp, logger, response);
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

process.on('SIGTERM', () => {
	//TODO: Сделать graceful shutdown
	logger.warn({ message: 'Graceful shutdown' });
	forceExit(500, 2);
});

process.on('uncaughtException', (error) => {
	logger.error({ error });
	forceExit();
});

process.on('unhandledRejection', (error) => {
	logger.error({ error });
	forceExit();
});
