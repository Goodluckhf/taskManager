import config from 'config';

import logger      from '../../../../lib/logger';
import WallSeekApi from '../../api/WallSeekApi';
import VkApi       from '../../../../lib/VkApi';

export default (router, passport) => {
	//@TODO: обновить DI
	const vkApi = new VkApi(config.get('vkApi.token'), {
		timeout: config.get('vkApi.timeout'),
	});
	const wallSeekApi = new WallSeekApi(vkApi, config, logger);
	
	router.post('/wallSeek', passport.authenticate('jwt', { session: false }), async (ctx) => {
		ctx.body = {
			success: true,
			data   : await wallSeekApi.add({
				...ctx.request.body,
				user: ctx.state.user,
			}),
		};
	});
	
	router.put('/wallSeek/:id/resume', passport.authenticate('jwt', { session: false }), async (ctx) => {
		const { id } = ctx.params;
		ctx.body = {
			success: true,
			data   : await wallSeekApi.resume(id, ctx.state.user),
		};
	});
	
	router.get('/wallSeek', passport.authenticate('jwt', { session: false }), async (ctx) => {
		ctx.body = {
			success: true,
			data   : await wallSeekApi.list(ctx.state.user),
		};
	});
};
