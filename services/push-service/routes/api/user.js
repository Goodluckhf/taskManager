import config from 'config';
import logger from '../../../../lib/logger';
import UserApi from '../../api/UserApi';

/**
 * @param {Router} router
 */
export default router => {
	const userApi = new UserApi(config, logger);

	router.post('/user', async ctx => {
		ctx.body = {
			success: true,
			data: await userApi.login(ctx.request.body),
		};
	});

	router.get('/user', async ctx => {
		ctx.body = {
			success: true,
			data: await userApi.login(ctx.request.body),
		};
	});
};
