import config       from 'config';
import VkApi        from '../../../../lib/VkApi';
import logger       from '../../../../lib/logger';
import AutoLikesApi from '../../api/AutoLikesApi';

export default (router, passport) => {
	const vkApi = new VkApi(config.get('vkApi.token'), {
		timeout: config.get('vkApi.timeout'),
	});
	
	// Сам классс Api
	const taskApi = new AutoLikesApi(vkApi, config, logger);
	
	router.post('/autolikes', passport.authenticate('jwt', { session: false }), async (ctx) => {
		ctx.body = {
			success: true,
			data   : await taskApi.create({
				...ctx.request.body,
				user: ctx.state.user,
			}),
		};
	});
	
	router.get('/autolikes', passport.authenticate('jwt', { session: false }), async (ctx) => {
		ctx.body = {
			success: true,
			data   : await taskApi.list({
				...ctx.request.query,
				user: ctx.state.user,
			}),
		};
	});
	
	// router.put('/autolikes/:id', passport.authenticate('jwt', { session: false }), async (ctx) => {
	// 	const { id } = ctx.params;
	//
	// 	ctx.body = {
	// 		success: true,
	// 		data   : await taskApi.update(id, ctx.request.body),
	// 	};
	// });
};
