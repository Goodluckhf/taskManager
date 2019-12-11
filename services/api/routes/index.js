import Router from 'koa-router';
import apiRoutes, { uMetrics } from './api';

const router = new Router();

router.use(apiRoutes.routes());

export default router;
export { uMetrics };
