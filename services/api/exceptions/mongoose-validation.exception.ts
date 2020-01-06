import mongoose from 'mongoose';
import {
	FormattableInterface,
	HttpStatusableInterface,
	ObjectableInterface,
} from '../../../lib/internal.types';

export class MongooseValidationException extends Error
	implements ObjectableInterface, FormattableInterface, HttpStatusableInterface {
	private readonly mongooseError: mongoose.Error.ValidationError;

	constructor(error: mongoose.Error.ValidationError) {
		super('Ошибка валидации');
		this.mongooseError = error;
	}

	toObject(): object {
		return Object.keys(this.mongooseError.errors).map(propertyKey => ({
			property: propertyKey,
			message: this.mongooseError.errors[propertyKey],
		}));
	}

	toFormattedString(): string {
		return Object.keys(this.mongooseError).reduce((str, propertyKey) => {
			return `${str}\n[${propertyKey}] должно быть "${JSON.stringify(
				this.mongooseError.errors[propertyKey],
			)}"`;
		}, '');
	}

	get status(): number {
		return 400;
	}
}
