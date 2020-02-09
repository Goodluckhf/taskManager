import 'source-map-support/register';

import { createContainer } from '../api/di.container';
import { RpcServer } from '../../lib/amqp/rpc-server';
import { LoggerInterface } from '../../lib/logger.interface';
import GracefulStop from '../../lib/graceful-stop';
import { AbstractRpcHandler } from '../../lib/amqp/abstract-rpc-handler';
import { PostCommentRpcHandler } from './rpc-handlers/post-comment-rpc.handler';
import { CheckVkUserRpcHandler } from './rpc-handlers/check-vk-user-rpc.handler';
import { JoinGroupRpcHandler } from './rpc-handlers/join-group-rpc.handler';
import { FeedBrowseRcpHandler } from './rpc-handlers/feed-browse-rcp.handler';
import { MessageBrowseRcpHandler } from './rpc-handlers/message-browse-rcp.handler';
import { GroupBrowseRcpHandler } from './rpc-handlers/group-browse-rcp.handler';
import { GroupFeedBrowseRcpHandler } from './rpc-handlers/group-feed-browse-rcp.handler';

const container = createContainer();
container.bind(AbstractRpcHandler).toConstructor(PostCommentRpcHandler);
container.bind(AbstractRpcHandler).toConstructor(CheckVkUserRpcHandler);
container.bind(AbstractRpcHandler).toConstructor(JoinGroupRpcHandler);
container.bind(AbstractRpcHandler).toConstructor(FeedBrowseRcpHandler);
container.bind(AbstractRpcHandler).toConstructor(MessageBrowseRcpHandler);
container.bind(AbstractRpcHandler).toConstructor(GroupBrowseRcpHandler);
container.bind(AbstractRpcHandler).toConstructor(GroupFeedBrowseRcpHandler);

container
	.bind<AbstractRpcHandler>(PostCommentRpcHandler)
	.toSelf()
	.inRequestScope();
container
	.bind<AbstractRpcHandler>(CheckVkUserRpcHandler)
	.toSelf()
	.inRequestScope();
container
	.bind<AbstractRpcHandler>(JoinGroupRpcHandler)
	.toSelf()
	.inRequestScope();
container
	.bind<AbstractRpcHandler>(FeedBrowseRcpHandler)
	.toSelf()
	.inRequestScope();
container
	.bind<AbstractRpcHandler>(MessageBrowseRcpHandler)
	.toSelf()
	.inRequestScope();
container
	.bind<AbstractRpcHandler>(GroupBrowseRcpHandler)
	.toSelf()
	.inRequestScope();
container
	.bind<AbstractRpcHandler>(GroupFeedBrowseRcpHandler)
	.toSelf()
	.inRequestScope();

const rpcServer = container.get<RpcServer>(RpcServer);
const logger = container.get<LoggerInterface>('Logger');
const gracefulStop = container.get<GracefulStop>(GracefulStop);

(async () => {
	try {
		await rpcServer.start(container);
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
