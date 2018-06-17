// @flow

import Router from 'koa-router';
import {
	create,
	list,
	update,
	finish,
} from '../../api/task';

import { ValidationError }     from '../../api/errors';
import  { type TaskPropsType } from '../../model/Task';
import logger from '../../lib/logger';

const router = new Router({ prefix: '/api' });

router.get('/tasks', async (ctx) => {
	ctx.body = await list();
});

router.post('/task', async (ctx) => {
	const { title } = ctx.request.body;
	if (!title || title.length === 0) {
		throw new ValidationError();
	}
	
	ctx.body = {
		success: true,
		data   : await create({ title }),
	};
});

router.post('/task/:id/finish', async (ctx) => {
	logger.info({
		param: ctx.params,
	});
	const { id } : { id: string } = ctx.params;
	
	if (!id || id.length === 0) {
		throw new ValidationError();
	}
	
	const task = await finish(id);
	
	ctx.response.body = {
		success: true,
		data   : task,
	};
});

export default router;
