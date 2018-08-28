import config from 'config';

import GroupApi from '../../api/GroupApi';
import VkApi    from '../../../../lib/VkApi';
import logger   from '../../../../lib/logger';

export default (router) => {
	const vkApi = new VkApi(config.get('vkApi.token'), {
		timeout: config.get('vkApi.timeout'),
	});
	
	const groupApi = new GroupApi(vkApi, config, logger);
	
	router.post('/group', async (ctx) => {
		ctx.body = {
			success: true,
			data   : await groupApi.add(ctx.request.body),
		};
	});
};
