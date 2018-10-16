import config   from 'config';
import Router   from 'koa-router';
import passport from 'koa-passport';

import logger    from '../../../../lib/logger';
import RpcClient from '../../../../lib/amqp/RpcClient';
import Amqp      from '../../../../lib/amqp/Amqp';

import createTaskRoute          from './task';
import createAutoLikesTaskRoute from './autolikes';
import createAccountRoute       from './account';
import createGroupRoute         from './group';
import createWallSeekRoute      from './wallSeek';
import createUserRoute          from './user';
import createAdminRoute         from './admin';
import Billing                  from '../../billing/Billing';

// rabbit, RPC client
const rabbitConfig = config.get('rabbit');
const amqp         = new Amqp(logger, rabbitConfig);
const rpcClient    = new RpcClient(amqp, logger);
rpcClient.start().catch((error) => {
	logger.error({ error });
});

const billing = new Billing(config, logger);

const router = new Router({ prefix: '/api' });

createTaskRoute(router, rpcClient, passport, billing);
createAccountRoute(router, rpcClient);
createWallSeekRoute(router, passport);
createGroupRoute(router, passport);
createAutoLikesTaskRoute(router, passport, billing);
createUserRoute(router, passport);
createAdminRoute(router, passport);

export default router;
