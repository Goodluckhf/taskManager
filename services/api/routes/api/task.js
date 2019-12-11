import config from 'config';
import VkApi from '../../../../lib/VkApi';
import logger from '../../../../lib/logger';
import TaskApi from '../../api/TaskApi';
import Alert from '../../../../lib/Alert';
import mongoose from '../../../../lib/mongoose';
import CommentsService from '../../services/CommentsService';
import LikeService from '../../services/LikeService';

/**
 * @param {Router} router
 * @param {RpcClient} rpcClient
 * @param {Passport} passport
 * @param {Billing} billing
 * @param {Captcha} captcha
 * @param {UMetrics} uMetrics
 */
export default (router, rpcClient, passport, billing, captcha, uMetrics) => {
	const vkApi = new VkApi(captcha, logger, config.get('vkApi.token'), {
		timeout: config.get('vkApi.timeout'),
	});
	const alert = new Alert(vkApi, logger);

	const commentsService = new CommentsService(config, rpcClient, logger);
	const likeService = new LikeService(config);

	// Сам классс Api
	const taskApi = new TaskApi(
		likeService,
		commentsService,
		rpcClient,
		alert,
		billing,
		uMetrics,
		config,
		logger,
	);

	router.post('/task/stop/:id', passport.authenticate('jwt', { session: false }), async ctx => {
		const { id } = ctx.params;

		ctx.body = {
			success: true,
			data: await taskApi.stop(id, ctx.state.user),
		};
	});

	router.delete('/task/:id', passport.authenticate('jwt', { session: false }), async ctx => {
		const { id } = ctx.params;

		ctx.body = {
			success: true,
			data: await taskApi.remove(id, ctx.state.user),
		};
	});

	router.get('/task/handleActive', async ctx => {
		const VkUserModel = mongoose.model('VkUser');
		const ProxyModel = mongoose.model('Proxy');
		taskApi.VkUser = VkUserModel;
		taskApi.Proxy = ProxyModel;
		ctx.body = {
			success: true,
			data: await taskApi.handleActiveTasks(),
		};
	});
};
