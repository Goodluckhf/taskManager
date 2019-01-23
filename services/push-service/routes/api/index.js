import Router from 'koa-router';

import createUserRoute from './user';

const router = new Router({ prefix: '/api' });

createUserRoute(router);
export default router;
