import config from 'config';

import AccountApi from '../../api/AccountApi';
import logger     from '../../../../lib/logger';

export default (router, rpcClient) => {
	const accountApi = new AccountApi(rpcClient, config, logger);
	
	router.post('/account', async (ctx) => {
		ctx.body = {
			success: true,
			data   : await accountApi.add(ctx.request.body),
		};
	});
};
