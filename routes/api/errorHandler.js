import BaseApiError from '../../api/errors/BaseApiError';
import logger from '../../lib/logger';

export default async (ctx, next) => {
	try {
		await next();
	} catch (error) {
		if (error instanceof BaseApiError) {
			logger.warn({
				message: 'API error',
				error,
			});
			ctx.body   = error.toObject();
			ctx.status = error.status;
			return;
		}
		
		ctx.app.emit('error', error, ctx);
		ctx.throw(500, 'Error Message');
	}
};
