import {
	FormattableInterface,
	HttpStatusableInterface,
	ObjectableInterface,
} from '../../../lib/internal.types';

export class LoginFailedException extends Error
	implements HttpStatusableInterface, ObjectableInterface, FormattableInterface {
	private readonly email: string;

	constructor(email) {
		super('Ошбика авторизации');
		this.email = email;
	}

	toObject() {
		return {
			email: this.email,
		};
	}

	readonly status = 401;

	toFormattedString(): string {
		return `${this.message}\nНе правильный логин или пароль`;
	}
}
