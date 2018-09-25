import config from 'config';
import Router from 'koa-router';

import logger    from '../../../../lib/logger';
import RpcClient from '../../../../lib/amqp/RpcClient';
import Amqp      from '../../../../lib/amqp/Amqp';

import createTaskRoute          from './task';
import createAutoLikesTaskRoute from './autolikes';
import createAccountRoute       from './account';
import createGroupRoute         from './group';
import createWallSeekRoute      from './wallSeek';

// rabbit, RPC client
const rabbitConfig = config.get('rabbit');
const amqp         = new Amqp(logger, rabbitConfig);
const rpcClient    = new RpcClient(amqp, logger);
rpcClient.start().catch((error) => {
	logger.error({ error });
});

const router = new Router({ prefix: '/api' });

createTaskRoute(router, rpcClient);
createAccountRoute(router, rpcClient);
createWallSeekRoute(router);
createGroupRoute(router);
createAutoLikesTaskRoute(router);

export default router;
