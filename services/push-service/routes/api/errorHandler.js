import mongoose from '../../../../lib/mongoose';

import BaseApiError from '../../api/errors/BaseApiError';
import logger from '../../../../lib/logger';
import { ValidationError } from '../../api/errors';
import BaseError from '../../api/errors/BaseError';

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

		if (!(error instanceof BaseError)) {
			if (error.request) {
				delete error.request;
			}

			if (error.response && error.response.request) {
				delete error.response.request;
			}

			error = new BaseApiError(error.message, 500).combine({ error });
		}
		const { user } = ctx.state;
		logger.warn({
			error,
			message: 'API error',
			userId: user ? user.id : null,
			url: ctx.url,
			method: ctx.method,
		});

		const errorMessage = error.toMessageString ? error.toMessageString() : error.message;
		ctx.body = {
			message: error.message,
			description: errorMessage,
		};
		ctx.status = error.status;
	}
};
