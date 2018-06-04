const Router     = require('koa-router');
const apiRoutes  = require('./api');


const router = new Router();

router.use(apiRoutes.routes());

module.exports = router;