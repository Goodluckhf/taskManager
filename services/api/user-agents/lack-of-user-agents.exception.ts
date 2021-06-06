import { FormattableInterface, ObjectableInterface } from '../../../lib/internal.types';
import { FatalableInterface } from '../task/fatalable.interface';

export class LackOfUserAgentsException extends Error
	implements ObjectableInterface, FormattableInterface, FatalableInterface {
	constructor() {
		super('Юзер агенты кончились');
	}

	toFormattedString(): string {
		return `${this.message}: VK забанил юзер агенты, нужно обновить список`;
	}

	toObject(): object {
		return {
			message: this.message,
			formattedMessage: this.toFormattedString(),
		};
	}

	isFatal = true;
}
