import Router      from 'koa-router';
import config      from 'config';
import TaskApi     from '../../api/TaskApi';
import VkApi       from '../../../../lib/VkApi';
import logger      from '../../../../lib/logger';
import RpcClient   from '../../../../lib/amqp/RpcClient';
import Amqp        from '../../../../lib/amqp/Amqp';

const vkApi = new VkApi(config.get('vkApi.token'), {
	timeout: config.get('vkApi.timeout'),
});

// rabbit, RPC client
const rabbitConfig = config.get('rabbit');
const amqp         = new Amqp(logger, rabbitConfig);
const rpcClient    = new RpcClient(amqp, logger);
rpcClient.start().catch((error) => {
	logger.error({ error });
});

// Сам классс Api
const taskApi = new TaskApi(rpcClient, config, vkApi, logger);


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

router.post('/task/stop/:id', async (ctx) => {
	const { id } = ctx.params;
	
	ctx.body = {
		success: true,
		data   : await taskApi.stop(id),
	};
});

router.get('/task/handleActive', async (ctx) => {
	ctx.body = {
		success: true,
		data   : await taskApi.handleActiveTasks(),
	};
});

router.put('/task/likes', async (ctx) => {
	ctx.body = {
		success: true,
		data   : await taskApi.setLikes(ctx.request.body),
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
