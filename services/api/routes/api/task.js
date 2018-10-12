import config  from 'config';
import VkApi   from '../../../../lib/VkApi';
import logger  from '../../../../lib/logger';
import TaskApi from '../../api/TaskApi';
import Alert   from '../../../../lib/Alert';

/**
 * @param {Router} router
 * @param {RpcClient} rpcClient
 * @param {Passport} passport
 * @param {Billing} billing
 */
export default (router, rpcClient, passport, billing) => {
	const vkApi = new VkApi(config.get('vkApi.token'), {
		timeout: config.get('vkApi.timeout'),
	});
	const alert = new Alert(vkApi, logger);
	
	// Сам классс Api
	const taskApi = new TaskApi(rpcClient, alert, billing, config, logger);
	
	router.post('/task/stop/:id', passport.authenticate('jwt', { session: false }), async (ctx) => {
		const { id } = ctx.params;
		
		ctx.body = {
			success: true,
			data   : await taskApi.stop(id, ctx.state.user),
		};
	});
	
	router.delete('/task/:id', passport.authenticate('jwt', { session: false }), async (ctx) => {
		const { id } = ctx.params;
		
		ctx.body = {
			success: true,
			data   : await taskApi.remove(id, ctx.state.user),
		};
	});
	
	router.get('/task/handleActive', async (ctx) => {
		ctx.body = {
			success: true,
			data   : await taskApi.handleActiveTasks(),
		};
	});
};
