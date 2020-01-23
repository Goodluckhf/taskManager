import { FormattableInterface, ObjectableInterface } from '../../../lib/internal.types';
import { FatalableInterface } from './fatalable.interface';
import { CommonTask } from './common-task';

export class UnhandledTaskException extends Error
	implements ObjectableInterface, FormattableInterface, FatalableInterface {
	private readonly originalError: Error;

	private readonly task: CommonTask;

	constructor(error: Error, task: CommonTask) {
		super('Unhandled exception');
		this.originalError = error;
		this.task = task;
	}

	toFormattedString(): string {
		return `${this.message}\n${this.originalError.message}`;
	}

	toObject(): object {
		const { user, ...taskWithoutUser } = this.task;
		return {
			task: taskWithoutUser,
			...this.originalError,
			stack: this.originalError.stack,
			isFatal: this.isFatal,
			formattedMessage: this.toFormattedString(),
		};
	}

	isFatal = false;
}
