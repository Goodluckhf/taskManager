// @flow

import Router from 'koa-router';
import {
	create,
	list,
	update,
} from '../../api/task';

import { ValidationError }     from '../../api/errors';
import  { type TaskPropsType } from '../../model/Task';

const router = new Router({ prefix: '/api' });

router.get('/tasks', async (ctx) => {
	ctx.body = await list();
});

router.post('/task', async (ctx) => {
	const { title } = ctx.request.body;
	if (!title) {
		return;
	}
	
	ctx.body = {
		success: true,
		data   : await create({ title }),
	};
});

router.post('/task/:id', async (ctx) => {
	const { id } : { id: string } = ctx.request.params;
	const data: TaskPropsType     = ctx.request.body;
	
	if (!id || id.length === 0) {
		throw new ValidationError();
	}
	
	ctx.response.body = {
		success: true,
		data   : update(id, data),
	};
});

export default router;
