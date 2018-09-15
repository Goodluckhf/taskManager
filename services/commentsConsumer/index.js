import config    from 'config';

import Amqp             from '../../lib/amqp/Amqp';
import logger           from '../../lib/logger';
import RpcServer        from '../../lib/amqp/RpcServer';
import CommentsResponse from './CommentsResponse';
import gracefulStop  from '../../lib/GracefulStop';

const rabbitConfig = config.get('rabbit');
const amqp = new Amqp(logger, {
	host : rabbitConfig.host,
	port : rabbitConfig.port,
	retry: false,
});

(async () => {
	try {
		const response = new CommentsResponse({
			logger,
			token   : config.get('z1y1x1.token'),
			queue   : config.get('commentsTask.queue'),
			prefetch: config.get('commentsTask.prefetch'),
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

process.on('unhandledRejection', (error) => {
	logger.error({ error });
	gracefulStop.forceStop();
});
