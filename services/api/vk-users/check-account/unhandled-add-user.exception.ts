import { FormattableInterface, ObjectableInterface } from '../../../../lib/internal.types';

export class UnhandledAddUserException extends Error
	implements ObjectableInterface, FormattableInterface {
	private readonly login: string;

	private readonly originalError: Error;

	constructor(login: string, error: Error) {
		super('Не понятная ошибка');
		this.login = login;
		this.originalError = error;
	}

	toFormattedString(): string {
		return `${this.message} (${this.originalError.message}) | ${this.login}`;
	}

	toObject(): object {
		return {
			login: this.login,
		};
	}
}
