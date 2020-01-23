import { FormattableInterface, ObjectableInterface } from '../../../lib/internal.types';
import { FatalableInterface } from './fatalable.interface';

export class UnhandledTaskException extends Error
	implements ObjectableInterface, FormattableInterface, FatalableInterface {
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

	isFatal = false;
}
