import { ValidationError as OriginalValidationError } from 'class-validator';
import {
	FormattableInterface,
	HttpStatusableInterface,
	ObjectableInterface,
} from '../../../lib/internal.types';

export class ValidationException extends Error
	implements ObjectableInterface, FormattableInterface, HttpStatusableInterface {
	private readonly errors: OriginalValidationError[];

	constructor(errors: OriginalValidationError[]) {
		super('Ошибка валидации');
		this.errors = errors;
	}

	toObject(): object {
		return this.errors.map(error => ({
			property: error.property,
			value: error.value,
			rule: error.constraints,
		}));
	}

	toFormattedString(): string {
		return this.errors.reduce((str, error) => {
			return `${str}\n[${error.property}] должно быть "${JSON.stringify(error.constraints)}"`;
		}, '');
	}

	get status(): number {
		return 400;
	}
}
