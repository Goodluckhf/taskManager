import Koa        from 'koa';
import morgan     from 'koa-morgan';
import bodyParser from 'koa-bodyparser';
import passport   from 'koa-passport';
import config     from 'config';

import logger             from '../../lib/logger';
import routes             from './routes';
import errorHandler       from './routes/api/errorHandler';
import initModels         from './model';
import gracefulStop       from '../../lib/GracefulStop';
import db                 from '../../lib/db';
import passportStrategies from './passport';

// Подключаемся к бд
const dbConnection = db.connect();

// Инициализируем модели
initModels(dbConnection);

const app = new Koa();

app.silent = false;
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}
app.use(bodyParser());
app.use(passport.initialize());
passportStrategies(passport, config.get('jwt.secret'));

app.use(errorHandler);
app.use(routes.routes());


app.use((ctx, next) => {
	ctx.response.status = 404;
	ctx.response.body   = 'Not found';
	next();
});

app.on('error', (error, ctx) => {
	logger.error({
		error,
		req: ctx.req,
		res: ctx.res,
	});
});

app.listen(config.get('api.port'));
logger.info(`server listening on port: ${config.get('api.port')}`);

process.on('uncaughtException', (error) => {
	logger.error({ error });
	gracefulStop.stop(1);
});

process.on('unhandledRejection', (_error, reason) => {
	const error = _error;
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
