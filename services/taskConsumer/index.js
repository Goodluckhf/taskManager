import config    from 'config';
import axios     from 'axios';

import Amqp                     from '../../lib/amqp/Amqp';
import logger                   from '../../lib/logger';
import RpcServer                from '../../lib/amqp/RpcServer';
import LikeProResponse          from './responses/likes/LikeProResponse/LikeProResponse';
import gracefulStop             from '../../lib/GracefulStop/index';
import Z1y1x1CommentsResponse   from './responses/comments/Z1y1x1Response';
import LikestCommentsResponse   from './responses/comments/LikestResponse';
import Z1y1x1RepostsResponse    from './responses/reposts/Z1y1x1Response';
import LikestRepostsResponse    from './responses/reposts/LikestResponse';
import Z1y1x1Response           from './responses/likes/Z1y1x1Response';
import LikestResponse           from './responses/likes/LikestResponse';
import Captcha                  from '../../lib/Captcha';
import VkApi                    from '../../lib/VkApi';
import LikesCheckResponse       from './responses/LikesCheckResponse';
import CommentsCheckResponse    from './responses/CommentsCheckResponse';
import RepostsCheckResponse     from './responses/RepostsCheckResponse';
import LastPostWithLinkResponse from './responses/LastPostWithLinkResponse';

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

const vkApi = new VkApi(captcha, logger, config.get('vkApi.token'), {
	timeout: config.get('vkApi.timeout'),
});

// Обработчики накрутки лайков
rpcServer
	.addResponse(new LikeProResponse({ logger, config }))
	.addResponse(new Z1y1x1Response({ logger, config }))
	.addResponse(new LikestResponse({
		captcha,
		logger,
		config,
	}));

rpcServer.addResponse(new LikesCheckResponse({
	logger,
	vkApi,
	config,
})).addResponse(new CommentsCheckResponse({
	logger,
	vkApi,
	config,
})).addResponse(new RepostsCheckResponse({
	logger,
	vkApi,
	config,
}));


// Обработчики накрутки комментов
rpcServer
	.addResponse(new Z1y1x1CommentsResponse({ logger, config }))
	.addResponse(new LikestCommentsResponse({
		captcha,
		logger,
		config,
	}));


// Обработчики накрутки репостов
rpcServer
	.addResponse(new Z1y1x1RepostsResponse({ logger, config }))
	.addResponse(new LikestRepostsResponse({
		captcha,
		logger,
		config,
	}));

// Проверка на выход рекламного поста
rpcServer.addResponse(new LastPostWithLinkResponse({ logger, config }));

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
