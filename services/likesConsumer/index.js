import config    from 'config';

import Amqp          from '../../lib/amqp/Amqp';
import logger        from '../../lib/logger';
import RpcServer     from '../../lib/amqp/RpcServer';
import LikesResponse from './LikesResponse';
import gracefulStop  from '../../lib/GracefulStop';

const rabbitConfig = config.get('rabbit');
const amqp = new Amqp(logger, {
	host : process.env.NODE_ENV === 'development' ? 'localhost' : rabbitConfig.host,
	port : rabbitConfig.port,
	retry: false,
});

(async () => {
	try {
		const response = new LikesResponse({
			logger,
			login   : config.get('likePro.login'),
			password: config.get('likePro.password'),
			queue   : config.get('likesTask.queue'),
			prefetch: config.get('likesTask.prefetch'),
		});
		
		const rpcServer = new RpcServer(amqp, logger, response, gracefulStop);
		await rpcServer.start();
		logger.info({
			message: 'rpc server started',
			queue  : response.queue,
		});
	} catch (error) {
		logger.error({ error });
		gracefulStop.forceStop();
	}
})();

process.on('SIGTERM', () => {
	gracefulStop.stop();
});

process.on('uncaughtException', (error) => {
	logger.error({ error });
	gracefulStop.forceStop();
});

process.on('unhandledRejection', (reason, promise) => {
	logger.error({ reason, promise });
	gracefulStop.forceStop(1);
});
