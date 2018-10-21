import config    from 'config';
import Router    from 'koa-router';
import passport  from 'koa-passport';
import axios     from 'axios';
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
import Captcha                  from '../../../../lib/Captcha';

// rabbit, RPC client
const rabbitConfig = config.get('rabbit');
const amqp         = new Amqp(logger, rabbitConfig);
const rpcClient    = new RpcClient(amqp, logger);
rpcClient.start().catch((error) => {
	logger.error({ error });
});

const billing = new Billing(config, logger);
const captcha = new Captcha(axios, config.get('rucaptcha.token'));

const router = new Router({ prefix: '/api' });

createTaskRoute(router, rpcClient, passport, billing, captcha);
createGroupRoute(router, passport, captcha);
createAutoLikesTaskRoute(router, passport, billing, captcha);
createUserRoute(router, passport, billing, axios, captcha);
createAdminRoute(router, passport, billing);

// Пока не используются
createWallSeekRoute(router, passport);
createAccountRoute(router, rpcClient);
export default router;
