import config  from 'config';
import VkApi   from '../../../../lib/VkApi';
import logger  from '../../../../lib/logger';
import TaskApi from '../../api/TaskApi';

export default (router, rpcClient) => {
	const vkApi = new VkApi(config.get('vkApi.token'), {
		timeout: config.get('vkApi.timeout'),
	});
	// Сам классс Api
	const taskApi = new TaskApi(rpcClient, vkApi, config, logger);
	
	router.post('/task', async (ctx) => {
		ctx.body = {
			success: true,
			data   : await taskApi.createLikes(ctx.request.body),
		};
	});
	
	router.get('/tasks', async (ctx) => {
		ctx.body = {
			success: true,
			data   : await taskApi.list(ctx.request.query),
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
};
