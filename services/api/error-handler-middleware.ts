import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import logger from '../../lib/logger';
import { User } from './users/user';
import { MongooseValidationException } from './exceptions/mongoose-validation.exception';
import { MongooseCastException } from './exceptions/mongoose-cast.exception';

export const errorHandlerMiddleware: ErrorRequestHandler = async (
	error,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (error instanceof mongoose.Error.ValidationError) {
		error = new MongooseValidationException(error);
	}

	if (error instanceof mongoose.Error.CastError) {
		error = new MongooseCastException(error);
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore
	const user = req.user as User;
	const errorDataObject = typeof error.toObject === 'function' ? error.toObject() : {};
	if (error.request) {
		delete error.request;
	}

	logger.warn({
		error,
		message: 'API error',
		userId: user ? user._id.toString() : null,
		url: req.url,
		method: req.method,
		...errorDataObject,
	});

	const errorMessage = error.toFormattedString ? error.toFormattedString() : error.message;
	res.status(error.status || 500).json({
		message: error.message,
		description: errorMessage,
	});
};
