import mongoose from 'mongoose';
import {
	FormattableInterface,
	HttpStatusableInterface,
	ObjectableInterface,
} from '../../../lib/internal.types';

export class MongooseCastException extends Error
	implements ObjectableInterface, FormattableInterface, HttpStatusableInterface {
	private readonly mongooseError: mongoose.Error.CastError;

	constructor(error: mongoose.Error.CastError) {
		super('Ошибка валидации');
		this.mongooseError = error;
	}

	toObject(): object {
		return {
			property: this.mongooseError.path,
			message: this.mongooseError.message,
		};
	}

	toFormattedString(): string {
		return `${this.message}\n[${this.mongooseError.path}] должно быть "${this.mongooseError.message}"`;
	}

	get status(): number {
		return 400;
	}
}
