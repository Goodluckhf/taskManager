import { FormattableInterface, ObjectableInterface } from '../../../lib/internal.types';

export class UnhandledTaskException extends Error
	implements ObjectableInterface, FormattableInterface {
	private readonly originalError: Error;

	constructor(error: Error) {
		super('Unhandled exception');
		this.originalError = error;
	}

	toFormattedString(): string {
		return `${this.message}\n${this.originalError.message}`;
	}

	toObject(): object {
		return {
			...this.originalError,
			stack: this.originalError.stack,
			formattedMessage: this.toFormattedString(),
		};
	}
}
