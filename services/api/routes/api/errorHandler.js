import mongoose from '../../../../lib/mongoose';

import BaseApiError      from '../../api/errors/BaseApiError';
import logger            from '../../../../lib/logger';
import { ValidationError } from '../../api/errors';

export default async (ctx, next) => {
	try {
		await next();
	} catch (_error) {
		let error = _error;
		if (error instanceof mongoose.Error.ValidationError) {
			error = ValidationError.createFromMongooseValidationError(error);
		}
		
		if (error instanceof mongoose.Error.CastError) {
			error = ValidationError.createFromMongooseCastError(error);
		}
		
		// Пока оборачиваем в ошбику
		// Чтобы на клиент все равно пришла ошибка
		
		if (!(error instanceof BaseApiError)) {
			if (error.request) {
				delete error.request;
			}
			error = new BaseApiError(error.message, 500).combine({ error });
		}
		
		logger.warn({
			message: 'API error',
			error,
		});
		ctx.body   = error.toObject();
		ctx.status = error.status;
	}
};
