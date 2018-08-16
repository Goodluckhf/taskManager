import Router    from 'koa-router';
import config    from 'config';
import TaskApi   from '../../api/TaskApi';
import VkApi     from '../../../../lib/VkApi';
import logger    from '../../../../lib/logger';
import RpcClient from '../../../../lib/amqp/RpcClient';
import Amqp      from '../../../../lib/amqp/Amqp';
import Request   from '../../../../lib/amqp/Request';

const vkApi = new VkApi(config.get('vkApi.token'), {
	timeout: config.get('vkApi.timeout'),
});

const taskApi = new TaskApi(config, vkApi, logger);

const rabbitConfig = config.get('rabbit');
const amqp = new Amqp(logger, rabbitConfig);

const rpcClient = new RpcClient(amqp, logger);
rpcClient.start().catch((error) => {
	logger.error({ error });
});

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

router.put('/task/:id', async (ctx) => {
	const { id } = ctx.params;
	
	ctx.body = {
		success: true,
		data   : await taskApi.updateLikes(id, ctx.request.body),
	};
});

router.get('/produce', async (ctx) => {
	const request = new Request({
		queue  : config.get('taskQueue.name'),
		timeout: 30000,
	});
	
	request.setMethod('produce', {
		a           : 10,
		testArgument: false,
	});
	
	ctx.body = {
		success: true,
		data   : await rpcClient.call(request),
	};
});

export default router;
