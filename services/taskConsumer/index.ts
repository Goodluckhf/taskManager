import 'source-map-support/register';

import { createContainer } from '../api/di.container';
import { RpcServer } from '../../lib/amqp/rpc-server';
import { LoggerInterface } from '../../lib/logger.interface';
import GracefulStop from '../../lib/graceful-stop';
import { AbstractRpcHandler } from '../../lib/amqp/abstract-rpc-handler';
import { PostCommentRpcHandler } from './rpc-handlers/post-comment-rpc.handler';
import { CheckVkUserRpcHandler } from './rpc-handlers/check-vk-user-rpc.handler';

const container = createContainer();
container.bind<AbstractRpcHandler>(AbstractRpcHandler).to(PostCommentRpcHandler);
container.bind<AbstractRpcHandler>(AbstractRpcHandler).to(CheckVkUserRpcHandler);

const rpcServer = container.get<RpcServer>(RpcServer);
const logger = container.get<LoggerInterface>('Logger');
const gracefulStop = container.get<GracefulStop>(GracefulStop);

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

process.on('uncaughtException', error => {
	logger.error({ error });
	gracefulStop.forceStop();
});

process.on('unhandledRejection', (reason, promise) => {
	logger.error({ reason, promise });
	gracefulStop.forceStop(1);
});
