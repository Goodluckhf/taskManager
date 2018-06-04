import Koa        from 'koa';
import morgan     from 'koa-morgan';
import bodyParser from 'koa-bodyparser';
import logger     from 'lib/logger';
import routes     from 'routes';
import config     from 'config';

const app = new Koa();

app.silent = false;

app.use(morgan('dev'));
app.use(bodyParser());
app.use(routes.routes());


app.use((ctx, next) => {
	ctx.response.status = 404;
	ctx.response.body   = 'Not found';
	next();
});

app.on('error', (err, ctx) => {
	logger.error({
		err,
		req: ctx.req,
		res: ctx.res,
	});
});

app.listen(config.get('server.port'));
