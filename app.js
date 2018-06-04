const Koa        = require('koa');
const morgan     = require('koa-morgan');
const bodyParser = require('koa-bodyparser');
const logger     = require('lib/logger');
const routes     = require('routes');


const app    = new Koa();

app.silent = false;
app.proxy  = true;

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

app.listen(3000);
