import config    from 'config';

import Amqp             from '../../lib/amqp/Amqp';
import logger           from '../../lib/logger';
import RpcServer        from '../../lib/amqp/RpcServer';
import LikeProResponse  from './responses/likes/LikeProResponse/LikeProResponse';
import gracefulStop     from '../../lib/GracefulStop/index';
import CommentsResponse from './responses/CommentsResponse';
import Z1y1x1Response   from './responses/likes/Z1y1x1Response';

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

// Обработчики накрутки лайков
rpcServer.addResponse(new LikeProResponse({
	logger,
	login   : config.get('likePro.login'),
	password: config.get('likePro.password'),
})).addResponse(new Z1y1x1Response({
	logger,
	token: config.get('z1y1x1.token'),
}));


// Обработчики накрутки комментов
rpcServer.addResponse(new CommentsResponse({
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
