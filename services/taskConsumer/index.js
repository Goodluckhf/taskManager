import config    from 'config';
import axios     from 'axios/index';

import Amqp                   from '../../lib/amqp/Amqp';
import logger                 from '../../lib/logger';
import RpcServer              from '../../lib/amqp/RpcServer';
import LikeProResponse        from './responses/likes/LikeProResponse/LikeProResponse';
import gracefulStop           from '../../lib/GracefulStop/index';
import Z1y1x1CommentsResponse from './responses/comments/Z1y1x1Response';
import LikestCommentsResponse from './responses/comments/LikestResponse';
import Z1y1x1Response         from './responses/likes/Z1y1x1Response';
import LikestResponse         from './responses/likes/LikestResponse';
import Captcha                from '../../lib/Captcha';

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

const captcha = new Captcha(axios, config.get('rucaptcha.token'));

// Обработчики накрутки лайков
rpcServer.addResponse(new LikeProResponse({
	logger,
	login   : config.get('likePro.login'),
	password: config.get('likePro.password'),
})).addResponse(new Z1y1x1Response({
	logger,
	token: config.get('z1y1x1.token'),
})).addResponse(new LikestResponse({
	captcha,
	logger,
	login   : config.get('likest.login'),
	password: config.get('likest.password'),
}));


// Обработчики накрутки комментов
rpcServer.addResponse(new Z1y1x1CommentsResponse({
	logger,
	token: config.get('z1y1x1.token'),
})).addResponse(new LikestCommentsResponse({
	captcha,
	logger,
	login   : config.get('likest.login'),
	password: config.get('likest.password'),
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
