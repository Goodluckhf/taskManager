import Router from 'koa-router';

import createUserRoute from './user';

const router = new Router({ prefix: '/push' });

createUserRoute(router);
export default router;
