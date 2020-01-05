import 'source-map-support/register';

import { createContainer } from '../api/di.container';
import { ConfigInterface } from '../../config/config.interface';
import { RpcServer } from '../../lib/amqp/rpc-server';
import { LoggerInterface } from '../../lib/logger.interface';
import GracefulStop from '../../lib/graceful-stop';

const container = createContainer();
const config = container.get<ConfigInterface>('Config');
const rabbitConfig = config.get('rabbit');
rabbitConfig.host = process.env.NODE_ENV === 'development' ? 'localhost' : rabbitConfig.host;
rabbitConfig.retry = false;
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
