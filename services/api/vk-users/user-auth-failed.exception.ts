import { FormattableInterface, ObjectableInterface } from '../../../lib/internal.types';

export class UserAuthFailedException extends Error
	implements ObjectableInterface, FormattableInterface {
	private readonly login: string;

	private readonly code: string;

	constructor(login: string, code: string) {
		super('Проблема при авторизации');
		this.login = login;
		this.code = code;
	}

	toFormattedString(): string {
		return `${this.message} (code: ${this.code}) | ${this.login}`;
	}

	toObject(): object {
		return {
			login: this.login,
			code: this.code,
		};
	}
}
