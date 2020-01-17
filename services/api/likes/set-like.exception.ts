import { FormattableInterface, ObjectableInterface } from '../../../lib/internal.types';

export class SetLikeException extends Error implements FormattableInterface, ObjectableInterface {
	private readonly code: string;

	private readonly description: string;

	constructor(code: string, description: string) {
		super('Ошибка по накрутке лайков на комментарий');
		this.code = code;
		this.description = description;
	}

	toFormattedString(): string {
		return `${this.message} | ${this.description} | code: ${this.code}`;
	}

	toObject(): object {
		return {
			code: this.code,
			description: this.description,
		};
	}
}
