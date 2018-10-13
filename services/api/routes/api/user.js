import config  from 'config';
import logger  from '../../../../lib/logger';
import UserApi from '../../api/UserApi';
import VkApi   from '../../../../lib/VkApi';

export default (router, passport) => {
	const vkApi = new VkApi(config.get('vkApi.token'), {
		timeout: config.get('vkApi.timeout'),
	});
	const userApi = new UserApi(vkApi, config, logger);
	
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
	
	router.get('/user', passport.authenticate('jwt', { session: false }), async (ctx) => {
		ctx.body = {
			success: true,
			data   : await userApi.getUser(ctx.state.user),
		};
	});
	
	router.get('/users', passport.authenticate('jwt', { session: false }), async (ctx) => {
		const { user } = ctx.state;
		if (user.__t !== 'Admin') {
			ctx.response.statusCode = 403;
			return;
		}
		
		ctx.body = {
			success: true,
			data   : await userApi.list(),
		};
	});
	
	router.post('/user/chat', passport.authenticate('jwt', { session: false }), async (ctx) => {
		ctx.body = {
			success: true,
			data   : await userApi.createChat({
				...ctx.request.body,
				user: ctx.state.user,
			}),
		};
	});
};
