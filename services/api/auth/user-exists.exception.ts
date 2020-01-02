import {
	FormattableInterface,
	HttpStatusableInterface,
	ObjectableInterface,
} from '../../../lib/internal.types';

export class UserExistsException extends Error
	implements HttpStatusableInterface, ObjectableInterface, FormattableInterface {
	private readonly email: string;

	constructor(email) {
		super('Пользоветель уже сущесвует');
		this.email = email;
	}

	toObject() {
		return {
			email: this.email,
		};
	}

	readonly status = 400;

	toFormattedString(): string {
		return `${this.message}\nПочта "${this.email}" уже занята (возможно вами)`;
	}
}
