import config from 'config';

import GroupApi from '../../api/GroupApi';
import VkApi    from '../../../../lib/VkApi';
import logger   from '../../../../lib/logger';

/**
 * @param {Router} router
 * @param {Passport} passport
 * @param {Captcha} captcha
 */
export default (router, passport, captcha) => {
	const vkApi = new VkApi(captcha, logger, config.get('vkApi.token'), {
		timeout: config.get('vkApi.timeout'),
	});
	
	const groupApi = new GroupApi(vkApi, config, logger);
	
	router.post('/group', passport.authenticate('jwt', { session: false }), async (ctx) => {
		ctx.body = {
			success: true,
			data   : await groupApi.add({
				...ctx.request.body,
				user: ctx.state.user,
			}),
		};
	});
	
	router.get('/groups', passport.authenticate('jwt', { session: false }), async (ctx) => {
		ctx.body = {
			success: true,
			data   : await groupApi.list({
				...ctx.request.query,
				user: ctx.state.user,
			}),
		};
	});
	
	router.put('/group/:id/target', passport.authenticate('jwt', { session: false }), async (ctx) => {
		const { id } = ctx.params;
		ctx.body = {
			success: true,
			data   : await groupApi.changeIsTarget(id, ctx.request.body.isTarget, ctx.state.user),
		};
	});
};
