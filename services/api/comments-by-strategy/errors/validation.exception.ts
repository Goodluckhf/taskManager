import { ValidationError as OriginalValidationError } from 'class-validator';
import {
	FormattableInterface,
	HttpStatusableInterface,
	ObjectableInterface,
} from '../../../../lib/internal.types';

export class ValidationException extends Error
	implements ObjectableInterface, FormattableInterface, HttpStatusableInterface {
	private readonly errors: OriginalValidationError[];

	constructor(errors: OriginalValidationError[]) {
		super('Validation error');
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
			return `${str}\n[${error.property}] should be "${error.constraints}"`;
		}, '');
	}

	get status(): number {
		return 400;
	}
}
