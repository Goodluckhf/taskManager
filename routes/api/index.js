import Router from 'koa-router';
import { create, list }    from 'api';
const router = new Router({ prefix: '/api' });

router.get('/tasks', async ctx => {
	ctx.body = await list();
});

router.post('/task', async ctx => {
	const title = ctx.request.body.title;
	if (! title) {
		return;
	}
	
	ctx.body = {
		success : true,
		data    : await create({ title }),
	};
});

export default router;