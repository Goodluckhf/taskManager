import { FormattableInterface, ObjectableInterface } from '../../../lib/internal.types';

export class LackOfUserAgentsException extends Error
	implements ObjectableInterface, FormattableInterface {
	constructor() {
		super('Юзер агенты кончились');
	}

	toFormattedString(): string {
		return `${this.message}: VK забанил юзер агенты, нужно обновить список`;
	}

	toObject(): object {
		return {};
	}
}
