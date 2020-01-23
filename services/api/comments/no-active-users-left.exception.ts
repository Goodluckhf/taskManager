import { FormattableInterface, ObjectableInterface } from '../../../lib/internal.types';
import { FatalableInterface } from '../task/fatalable.interface';

export class NoActiveUsersLeftException extends Error
	implements FormattableInterface, FatalableInterface, ObjectableInterface {
	isFatal = true;

	constructor() {
		super('Закончились активные пользователи');
	}

	toFormattedString(): string {
		return this.message;
	}

	toObject(): object {
		return {};
	}
}
