import { FormattableInterface, ObjectableInterface } from '../../../lib/internal.types';

export class UserExistsException extends Error
	implements ObjectableInterface, FormattableInterface {
	private readonly login: string;

	constructor(login: string) {
		super('Пользователь с таким логином уже существует');
		this.login = login;
	}

	toFormattedString(): string {
		return `${this.message}: ${this.login}`;
	}

	toObject(): object {
		return {
			login: this.login,
		};
	}
}
