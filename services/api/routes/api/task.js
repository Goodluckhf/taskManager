import config  from 'config';
import VkApi   from '../../../../lib/VkApi';
import logger  from '../../../../lib/logger';
import TaskApi from '../../api/TaskApi';
import Alert   from '../../../../lib/Alert';

export default (router, rpcClient) => {
	const vkApi = new VkApi(config.get('vkApi.token'), {
		timeout: config.get('vkApi.timeout'),
	});
	const alert = new Alert(vkApi, logger);
	
	// Сам классс Api
	const taskApi = new TaskApi(rpcClient, alert, config, logger);
	
	router.post('/task/stop/:id', async (ctx) => {
		const { id } = ctx.params;
		
		ctx.body = {
			success: true,
			data   : await taskApi.stop(id),
		};
	});
	
	router.delete('/task/:id', async (ctx) => {
		const { id } = ctx.params;
		
		ctx.body = {
			success: true,
			data   : await taskApi.remove(id),
		};
	});
	
	router.get('/task/handleActive', async (ctx) => {
		ctx.body = {
			success: true,
			data   : await taskApi.handleActiveTasks(),
		};
	});
};
