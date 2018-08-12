import Router  from 'koa-router';
import config  from 'config';
import TaskApi from '../../api/TaskApi';
import VkApi   from '../../../../lib/VkApi';
import logger  from '../../../../lib/logger';

const vkApi = new VkApi(config.get('vkApi.token'), {
	timeout: config.get('vkApi.timeout'),
});

const taskApi = new TaskApi(config, vkApi, logger);


const router = new Router({ prefix: '/api' });

router.post('/task', async (ctx) => {
	ctx.body = {
		success: true,
		data   : await taskApi.createLikes(ctx.request.body),
	};
});

router.get('/task', async (ctx) => {
	ctx.body = {
		success: true,
		data   : await taskApi.getActual(),
	};
});

router.put('/task/:id', async (ctx) => {
	const { id } = ctx.params;
	
	ctx.body = {
		success: true,
		data   : await taskApi.updateLikes(id, ctx.request.body),
	};
});

export default router;
