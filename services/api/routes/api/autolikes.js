import config         from 'config';
import VkApi          from '../../../../lib/VkApi';
import logger         from '../../../../lib/logger';
import AutoLikesApi   from '../../api/AutoLikesApi';

/**
 * @param {Router} router
 * @param {Passport} passport
 * @param {Billing} billing
 */
export default (router, passport, billing) => {
	const vkApi = new VkApi(config.get('vkApi.token'), {
		timeout: config.get('vkApi.timeout'),
	});
	
	// Сам классс Api
	const taskApi = new AutoLikesApi(vkApi, billing, config, logger);
	
	router.post('/autolikes', passport.authenticate('jwt', { session: false }), async (ctx) => {
		const { user } = ctx.state;
		const account  = billing.createAccount(user);
		
		ctx.body = {
			success: true,
			data   : await taskApi.create(account, ctx.request.body),
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
