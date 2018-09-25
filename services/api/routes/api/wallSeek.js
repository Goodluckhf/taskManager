import config from 'config';

import logger      from '../../../../lib/logger';
import WallSeekApi from '../../api/WallSeekApi';
import VkApi       from '../../../../lib/VkApi';

export default (router) => {
	const vkApi = new VkApi(config.get('vkApi.token'), {
		timeout: config.get('vkApi.timeout'),
	});
	const wallSeekApi = new WallSeekApi(vkApi, config, logger);
	
	router.post('/wallSeek', async (ctx) => {
		ctx.body = {
			success: true,
			data   : await wallSeekApi.add(ctx.request.body),
		};
	});
	
	router.get('/wallSeek', async (ctx) => {
		ctx.body = {
			success: true,
			data   : await wallSeekApi.list(),
		};
	});
};
