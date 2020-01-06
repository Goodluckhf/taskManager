import 'source-map-support/register';

import { createContainer } from './di.container';
import { ConfigInterface } from '../../config/config.interface';
import { LoggerInterface } from '../../lib/logger.interface';
import GracefulStop from '../../lib/graceful-stop';
import { Database } from '../../lib/inversify-typegoose/database';
import { VkUsersMetricsService } from './metrics/vk-users-metrics.service';
import { ProxyMetricsService } from './metrics/proxy-metrics.service';
import { createApplication } from './create-application';
import { UmetricsWrapper } from './metrics/umetrics-wrapper';
import RpcClient from '../../lib/amqp/rpc-client';

const diContainer = createContainer();

const config = diContainer.get<ConfigInterface>('Config');
const rpcClient = diContainer.get<RpcClient>(RpcClient);
const logger = diContainer.get<LoggerInterface>('Logger');
const gracefulStop = diContainer.get<GracefulStop>(GracefulStop);
const uMetricsWrapper = diContainer.get<UmetricsWrapper>(UmetricsWrapper);
const database = diContainer.get(Database);
const vkUsersMetricsService = diContainer.get(VkUsersMetricsService);
const proxyMetricsService = diContainer.get(ProxyMetricsService);

process.on('uncaughtException', error => {
	logger.error({ error });
	gracefulStop.stop(1);
});

process.on('unhandledRejection', (_error, reason) => {
	const error: any = _error;
	if (error.request) {
		delete error.request;
	}

	logger.error({ error, reason });
});

// @TODO: Для прод мода убрать
process.on('SIGTERM', () => {
	if (process.env.NODE_ENV === 'development') {
		process.exit(0);
		return;
	}

	gracefulStop.stop(0);
});

(async () => {
	await database.connect();
	await rpcClient.start();
	uMetricsWrapper.start();
	// При рестарте api нужно убрать статус pending
	// Т.к рестарт не всегда бывает graceful
	// @TODO: пока убрал (не реализовано на новой архитектуре)
	// await mongoose.model('AutoLikesTask').update(
	// 	{
	// 		deletedAt: null,
	// 		status: mongoose.model('Task').status.pending,
	// 	},
	// 	{ $set: { status: mongoose.model('Task').status.waiting } },
	// 	{ multi: true },
	// );

	setInterval(async () => {
		try {
			await vkUsersMetricsService.storeCurrentValue();
			await proxyMetricsService.storeCurrentValue();
		} catch (error) {
			logger.warn({
				message: 'proxy/vk metrics get',
				error,
			});
		}
	}, 15000);

	createApplication(diContainer).listen(config.get('api.port'));

	logger.info(`server listening on port: ${config.get('api.port')}`);
})().catch(error => {
	logger.error({
		message: 'fatal error',
		error,
	});
	setTimeout(() => {
		process.exit(1);
	}, 1000);
});
