import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import mongoose from '../../lib/mongoose';
import BaseApiError from './api/errors/BaseApiError';
import logger from '../../lib/logger';
import { ValidationError } from './api/errors/index';
import BaseError from './api/errors/BaseError';
import { User } from './users/user';

export const errorHandlerMiddleware: ErrorRequestHandler = async (
	error,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (error instanceof mongoose.Error.ValidationError) {
		error = ValidationError.createFromMongooseValidationError(error);
	}

	if (error instanceof mongoose.Error.CastError) {
		error = ValidationError.createFromMongooseCastError(error);
	}

	const user = req.user as User;
	logger.warn({
		error,
		errorData: typeof error.toObject === 'function' ? error.toObject() : {},
		message: 'API error',
		userId: user ? user._id.toString() : null,
		url: req.url,
		method: req.method,
	});

	const errorMessage = error.toFormattedString ? error.toFormattedString() : error.message;
	res.status(error.status || 500).json({
		message: error.message,
		description: errorMessage,
	});
};
