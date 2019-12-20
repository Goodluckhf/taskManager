import 'source-map-support/register';

import bodyParser from 'koa-bodyparser';

import diContainer from './di.container';
import mongoose from '../../lib/mongoose';
import routes, { uMetrics } from './routes';
import errorHandler from './routes/api/errorHandler';
import initModels from './model';
import db from '../../lib/db';
import passportStrategies from './passport';
import { ConfigInterface } from '../../config/config.interface';
import { LoggerInterface } from '../../lib/logger.interface';
import GracefulStop from '../../lib/graceful-stop';
import { ApplicationInterface } from '../../lib/framework/application.interface';
import { KoaApplication } from '../../lib/framework/koa-application';

const config = diContainer.get<ConfigInterface>('Config');
const logger = diContainer.get<LoggerInterface>('Logger');
const gracefulStop = diContainer.get<GracefulStop>(GracefulStop);
const application = diContainer.get<ApplicationInterface>(KoaApplication);
const application = diContainer.get<>(KoaApplication);

application.use(bodyParser());
application.use();
passportStrategies(passport, config.get('jwt.secret'));

application.use(errorHandler);
application.use(routes.routes());

application.use(async (ctx, next) => {
	ctx.response.status = 404;
	ctx.response.body = 'Not found';
	await next();
});

application.on('error', (error, ctx) => {
	logger.error({
		error,
		req: ctx.req,
		res: ctx.res,
	});
});

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
	// Подключаемся к бд
	const dbConnection = db.connect();
	// Инициализируем модели
	initModels(dbConnection);

	// При рестарте api нужно убрать статус pending
	// Т.к рестарт не всегда бывает graceful
	await mongoose.model('AutoLikesTask').update(
		{
			deletedAt: null,
			status: mongoose.model('Task').status.pending,
		},
		{ $set: { status: mongoose.model('Task').status.waiting } },
		{ multi: true },
	);

	setInterval(async () => {
		try {
			const countAccounts = await mongoose.model('VkUser').countActive();
			const countProxies = await mongoose.model('Proxy').countActive();
			uMetrics.activeVkAccounts.inc(countAccounts);
			uMetrics.activeProxies.inc(countProxies);
		} catch (error) {
			logger.warn({
				message: 'proxy/vk metrics get',
				error,
			});
		}
	}, 15000);

	application.listen(config.get('api.port'));
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
