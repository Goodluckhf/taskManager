import Router from 'koa-router';
import passport from 'koa-passport';

import createUserRoute from './user';

const router = new Router({ prefix: '/api' });

createUserRoute(router, passport);
export default router;
