import {
	FormattableInterface,
	HttpStatusableInterface,
	ObjectableInterface,
} from '../../../lib/internal.types';

export class PendingTaskException extends Error
	implements ObjectableInterface, FormattableInterface, HttpStatusableInterface {
	private readonly taskId: string;

	constructor(taskId: string) {
		super('Нельзя удалить задачу пока она выполняется');
		this.taskId = taskId;
	}

	toFormattedString(): string {
		return this.message;
	}

	toObject(): object {
		return {
			taskId: this.taskId,
		};
	}

	readonly status: 400;
}
