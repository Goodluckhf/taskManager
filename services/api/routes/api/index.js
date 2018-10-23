import config    from 'config';
import Router    from 'koa-router';
import passport  from 'koa-passport';
import axios     from 'axios';
import { UMetrics, PullTransport } from 'umetrics';

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

const transport = new PullTransport(logger, config.get('uMetrics.port'));
const uMetrics  = new UMetrics(transport, { prefix: 'umetrics' });
uMetrics.start();
// @TODO: Переложить в отдельное место
// Пока метрики регистриурются здесь

/** @property taskSuccessCount */
uMetrics.register(uMetrics.Metrics.Gauge, 'taskSuccessCount', {
	ttl   : config.get('uMetrics.ttl'),
	labels: ['task_type'],
});

/** @property taskErrorCount */
uMetrics.register(uMetrics.Metrics.Gauge, 'taskErrorCount', {
	ttl   : config.get('uMetrics.ttl'),
	labels: ['task_type'],
});

/** @property taskDuration */
uMetrics.register(uMetrics.Metrics.Gauge, 'taskDuration', {
	ttl   : config.get('uMetrics.ttl'),
	labels: ['task_type'],
});

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

createTaskRoute(router, rpcClient, passport, billing, captcha, uMetrics);
createGroupRoute(router, passport, captcha);
createAutoLikesTaskRoute(router, passport, billing, captcha);
createUserRoute(router, passport, billing, axios, captcha);
createAdminRoute(router, passport, billing);

// Пока не используются
createWallSeekRoute(router, passport);
createAccountRoute(router, rpcClient);
export default router;
