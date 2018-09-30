import config from 'config';
import logger from '../../../../lib/logger';
import UserApi from '../../api/UserApi';

export default (router, passport) => {
	const userApi = new UserApi(passport, config, logger);
	
	router.post('/login', async (ctx) => {
		ctx.body = {
			success: true,
			data   : await userApi.login(ctx.request.body),
		};
	});
	
	router.post('/register', async (ctx) => {
		ctx.body = {
			success: true,
			data   : await userApi.register(ctx.request.body),
		};
	});
};
