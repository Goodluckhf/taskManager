import mongoose from 'mongoose';

import BaseApiError      from '../../api/errors/BaseApiError';
import logger            from '../../../../lib/logger';
import { ValidationError } from '../../api/errors';

export default async (ctx, next) => {
	try {
		await next();
	} catch (_error) {
		let error = _error;
		if (error instanceof mongoose.Error.ValidationError) {
			error = ValidationError.createFromMongoose(error);
		}
		
		if (error instanceof BaseApiError) {
			logger.warn({
				message: 'API error',
				error,
			});
			ctx.body   = error.toObject();
			ctx.status = error.status;
			return;
		}
		
		ctx.throw(500, error);
	}
};
