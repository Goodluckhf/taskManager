import config from 'config';
import logger from '../../../../lib/logger';
import CommentsByStrategyApi from '../../api/CommentsByStrategyApi';

/**
 * @param {Router} router
 * @param {Passport} passport
 * @param {Billing} billing
 **/
export default (router, passport, billing) => {
	const commentsByStrategyApi = new CommentsByStrategyApi(config, logger);

	router.post(
		'/comments-by-strategy',
		passport.authenticate('jwt', { session: false }),
		async ctx => {
			const account = billing.createAccount(ctx.user);

			ctx.body = {
				success: true,
				data: await commentsByStrategyApi.create(account, {
					...ctx.request.body,
				}),
			};
		},
	);

	router.get(
		'/comments-by-strategy',
		passport.authenticate('jwt', { session: false }),
		async ctx => {
			ctx.body = {
				success: true,
				data: await commentsByStrategyApi.list(ctx.state.user),
			};
		},
	);
};
