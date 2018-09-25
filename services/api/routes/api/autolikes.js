import config       from 'config';
import VkApi        from '../../../../lib/VkApi';
import logger       from '../../../../lib/logger';
import AutoLikesApi from '../../api/AutoLikesApi';

export default (router) => {
	const vkApi = new VkApi(config.get('vkApi.token'), {
		timeout: config.get('vkApi.timeout'),
	});
	
	// Сам классс Api
	const taskApi = new AutoLikesApi(vkApi, config, logger);
	
	router.post('/autolikes', async (ctx) => {
		ctx.body = {
			success: true,
			data   : await taskApi.create(ctx.request.body),
		};
	});
	
	router.get('/autolikes', async (ctx) => {
		ctx.body = {
			success: true,
			data   : await taskApi.list(ctx.request.query),
		};
	});
	
	router.put('/autolikes/:id', async (ctx) => {
		const { id } = ctx.params;
		
		ctx.body = {
			success: true,
			data   : await taskApi.update(id, ctx.request.body),
		};
	});
};
