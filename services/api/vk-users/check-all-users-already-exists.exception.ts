import {
	FormattableInterface,
	HttpStatusableInterface,
	ObjectableInterface,
} from '../../../lib/internal.types';

export class CheckAllUsersAlreadyExistsException extends Error
	implements HttpStatusableInterface, ObjectableInterface, FormattableInterface {
	constructor() {
		super('Задача на проверку всех аккаунтов уже стоит в очереди на выполнение');
	}

	readonly status = 400;

	toFormattedString(): string {
		return this.message;
	}

	toObject(): object {
		return {};
	}
}
