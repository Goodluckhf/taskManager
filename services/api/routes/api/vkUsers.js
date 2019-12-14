import config from 'config';
import logger from '../../../../lib/logger';
import VkUsersApi from '../../api/VkUsersApi';

/**
 * @param {Router} router
 * @param {Passport} passport
 * @param {Billing} billing
 **/
export default (router, passport, billing) => {
	const checkAndAddUsersApi = new VkUsersApi(config, logger);

	router.post('/vk-users-task', passport.authenticate('jwt', { session: false }), async ctx => {
		const account = billing.createAccount(ctx.state.user);

		ctx.body = {
			success: true,
			data: await checkAndAddUsersApi.createTask(account, {
				...ctx.request.body,
			}),
		};
	});

	router.get('/vk-users-tasks', passport.authenticate('jwt', { session: false }), async ctx => {
		ctx.body = {
			success: true,
			data: await checkAndAddUsersApi.listTask(ctx.state.user),
		};
	});

	router.get('/vk-users/active', passport.authenticate('jwt', { session: false }), async ctx => {
		ctx.body = {
			success: true,
			data: await checkAndAddUsersApi.getActiveUsersCount(),
		};
	});
};
