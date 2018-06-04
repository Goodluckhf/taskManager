const Router = require('koa-router');


const router = new Router({prefix: '/api'});

router.get('/test', async ctx => {
	ctx.body = 100;
});


module.exports = router;