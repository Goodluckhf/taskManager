import { FormattableInterface, ObjectableInterface } from '../../../lib/internal.types';

export class SomeChecksFailedException extends Error
	implements ObjectableInterface, FormattableInterface {
	private readonly errors: Array<ObjectableInterface & FormattableInterface>;

	constructor(errors: Array<ObjectableInterface & FormattableInterface>) {
		super('Ошибка при проверке аккаунтов');
		this.errors = errors;
	}

	toFormattedString(): string {
		return this.errors.reduce((str, error) => {
			return `${str}\n---------\nОшибка: ${error.toFormattedString()}`;
		}, '');
	}

	toObject(): object {
		return {
			arrayErrorData: this.errors.map(error => error.toObject()),
			formattedMessage: this.toFormattedString(),
		};
	}
}
