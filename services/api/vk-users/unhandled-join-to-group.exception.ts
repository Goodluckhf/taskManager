import { FormattableInterface, ObjectableInterface } from '../../../lib/internal.types';

export class UnhandledJoinToGroupException extends Error
	implements ObjectableInterface, FormattableInterface {
	private readonly login: string;

	private readonly groupId: string;

	private readonly originalError: Error;

	constructor(originalError: Error, login: string, groupId: string) {
		super('Не смогли вступить в группу');
		this.login = login;
		this.groupId = groupId;
		this.originalError = originalError;
	}

	toFormattedString(): string {
		return `${this.message} (${this.originalError.message}) | Логин: ${this.login} | Группа: ${this.groupId}`;
	}

	toObject(): object {
		return {
			...this.originalError,
			login: this.login,
			groupId: this.groupId,
			formattedMessage: this.toFormattedString(),
			originalErrorStack: this.originalError.stack,
		};
	}
}
