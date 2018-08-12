import Koa          from 'koa';
import morgan       from 'koa-morgan';
import bodyParser   from 'koa-bodyparser';
import config       from 'config';
import logger       from '../../lib/logger';
import routes       from './routes';
import errorHandler from './routes/api/errorHandler';
import initModels   from './model';

import db from '../../lib/db';

// Подключаемся к бд
const dbConnection = db.connect();

// Инициализируем модели
initModels(dbConnection);

const app = new Koa();

app.silent = false;

app.use(morgan('dev'));
app.use(bodyParser());
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
});

process.on('unhandledRejection', (error) => {
	logger.error({ error });
});

// @TODO: Для прод мода убрать
process.on('SIGTERM', () => {
	process.exit(0);
});
