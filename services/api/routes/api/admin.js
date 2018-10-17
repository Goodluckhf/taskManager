import config from 'config';

import logger     from '../../../../lib/logger';
import AdminApi   from '../../api/AdminApi';

/**
 * @param {Router} router
 * @param {Passport} passport
 * @param {Billing} billing
 */
export default (router, passport, billing) => {
	const adminApi = new AdminApi(billing, config, logger);
	
	router.put('/user/:userId/balance', passport.authenticate('jwt', { session: false }), async (ctx) => {
		const { user }     = ctx.state;
		const { userId }   = ctx.params;
		const { quantity } = ctx.request.body;
		
		if (user.__t !== 'Admin') {
			ctx.response.statusCode = 403;
			return;
		}
		
		ctx.body = {
			success: true,
			data   : await adminApi.increaseBalance(userId, parseInt(quantity, 10)),
		};
	});
};
