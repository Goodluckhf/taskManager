import { FormattableInterface, ObjectableInterface } from '../../../lib/internal.types';
import { FatalableInterface } from '../task/fatalable.interface';

export class RetriesExceededException extends Error
	implements FormattableInterface, ObjectableInterface, FatalableInterface {
	isFatal = false;

	constructor() {
		super('Retries exceeded');
	}

	toFormattedString(): string {
		return this.message;
	}

	toObject(): object {
		return {};
	}
}
