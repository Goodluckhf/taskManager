import BaseApiError from '../../api/errors/BaseApiError';

export default async (ctx, next) => {
	try {
		await next();
	} catch (error) {
		if (error instanceof BaseApiError) {
			ctx.body   = error.toJson();
			ctx.status = error.status;
			return;
		}
		
		ctx.app.emit('error', error, ctx);
		ctx.throw(500, 'Error Message');
	}
};
