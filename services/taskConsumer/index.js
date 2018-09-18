import config    from 'config';

import Amqp             from '../../lib/amqp/Amqp';
import logger           from '../../lib/logger';
import RpcServer        from '../../lib/amqp/RpcServer';
import LikesResponse    from './responses/LikesResponse/LikesResponse';
import gracefulStop     from '../../lib/GracefulStop/index';
import CommentsResponse from './responses/CommentsResponse';

const rabbitConfig = config.get('rabbit');
const amqp = new Amqp(logger, {
	host    : process.env.NODE_ENV === 'development' ? 'localhost' : rabbitConfig.host,
	port    : rabbitConfig.port,
	login   : rabbitConfig.login,
	password: rabbitConfig.password,
	retry   : false,
});
const rpcServer = new RpcServer(amqp, logger, gracefulStop, {
	queue   : config.get('tasksQueue.name'),
	prefetch: config.get('tasksQueue.prefetch'),
});

rpcServer.addResponse(new LikesResponse({
	logger,
	login   : config.get('likePro.login'),
	password: config.get('likePro.password'),
	method  : config.get('likesTask.method'),
})).addResponse(new CommentsResponse({
	logger,
	token : config.get('z1y1x1.token'),
	method: config.get('commentsTask.method'),
}));

(async () => {
	try {
		await rpcServer.start();
		logger.info('rpc server started');
	} catch (error) {
		logger.error({ error });
		gracefulStop.forceStop();
	}
})();

process.on('SIGINT', () => {
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
