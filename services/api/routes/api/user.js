import config from 'config';
import logger from '../../../../lib/logger';
import UserApi from '../../api/UserApi';
import VkApi from '../../../../lib/VkApi';

/**
 * @param {Router} router
 * @param {Passport} passport
 * @param {Billing} billing
 * @param {Axios} axios
 * @param {Captcha} captcha
 */
export default (router, passport, billing, axios, captcha) => {
	const vkApi = new VkApi(captcha, logger, config.get('vkApi.token'), {
		timeout: config.get('vkApi.timeout'),
	});
	const userApi = new UserApi(vkApi, billing, axios, config, logger);

	router.post('/login', async ctx => {
		ctx.body = {
			success: true,
			data: await userApi.login(ctx.request.body),
		};
	});

	router.post('/register', async ctx => {
		ctx.body = {
			success: true,
			data: await userApi.register(ctx.request.body),
		};
	});

	router.get('/user', passport.authenticate('jwt', { session: false }), async ctx => {
		const { user } = ctx.state;
		const account = billing.createAccount(user);

		ctx.body = {
			success: true,
			data: await userApi.getUser(account),
		};
	});

	router.get('/users', passport.authenticate('jwt', { session: false }), async ctx => {
		const { user } = ctx.state;
		if (user.__t !== 'Admin') {
			ctx.response.statusCode = 403;
			return;
		}

		ctx.body = {
			success: true,
			data: await userApi.list(),
		};
	});

	router.post('/user/chat', passport.authenticate('jwt', { session: false }), async ctx => {
		ctx.body = {
			success: true,
			data: await userApi.createChat({
				...ctx.request.body,
				user: ctx.state.user,
			}),
		};
	});

	router.put('/user/links', passport.authenticate('jwt', { session: false }), async ctx => {
		ctx.body = {
			success: true,
			data: await userApi.setExternalLinks(ctx.state.user, ctx.request.body.links),
		};
	});

	router.post(
		'/user/balance/check',
		passport.authenticate('jwt', { session: false }),
		async ctx => {
			const { user } = ctx.state;
			const account = billing.createAccount(user);

			ctx.body = {
				success: true,
				data: await userApi.checkPayment(account),
			};
		},
	);

	router.post(
		'/user/balance/:amount',
		passport.authenticate('jwt', { session: false }),
		async ctx => {
			const { amount } = ctx.params;
			const { user } = ctx.state;
			const account = billing.createAccount(user);

			ctx.body = {
				success: true,
				data: await userApi.createTopUpInvoice(account, amount),
			};
		},
	);

	router.get(
		'/billing/convert/:amount',
		passport.authenticate('jwt', { session: false }),
		async ctx => {
			const { amount } = ctx.params;

			ctx.body = {
				success: true,
				data: userApi.convertMoney(amount),
			};
		},
	);

	router.get('/billing/invoices', passport.authenticate('jwt', { session: false }), async ctx => {
		const { user } = ctx.state;

		ctx.body = {
			success: true,
			data: await userApi.getInvoices(user, ctx.request.query.status),
		};
	});
};
