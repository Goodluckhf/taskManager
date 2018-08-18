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

router.get('/task/handleActive', async (ctx) => {
	ctx.body = {
		success: true,
		data   : await taskApi.handleActiveTasks(),
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
	const tasks = Promise.all(Array.from({ length: 20 }).map((_, index) => {
		const request = new Request({
			queue  : config.get('taskQueue.name'),
			timeout: 30000,
		});
		
		request.setMethod('produce', {
			index,
			testArgument: false,
		});
		return rpcClient.call(request);
	}));
	
	ctx.body = {
		success: true,
		data   : await tasks,
	};
});

export default router;
