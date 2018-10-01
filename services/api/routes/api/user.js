import config from 'config';
import logger from '../../../../lib/logger';
import UserApi from '../../api/UserApi';

export default (router, passport) => {
	const userApi = new UserApi(config, logger);
	
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
	
	router.put('/user/tokens', passport.authenticate('jwt', { session: false }), async (ctx) => {
		ctx.body = {
			success: true,
			data   : await userApi.updateTokens(ctx.state.user, ctx.request.body),
		};
	});
};
