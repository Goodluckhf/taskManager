import { FormattableInterface, ObjectableInterface } from '../../../lib/internal.types';

export class CommentsClosedException extends Error
	implements ObjectableInterface, FormattableInterface {
	private readonly originalError: Error;

	private readonly commentTextOnError: string;

	constructor(originalError: Error, commentTextOnError: string) {
		super('Комментарии закрыты');
		this.originalError = originalError;
		this.commentTextOnError = commentTextOnError;
	}

	toFormattedString(): string {
		return `${this.message} | ${this.originalError.message} \nТекст комментария: "${this.commentTextOnError}"`;
	}

	toObject(): object {
		return {
			...this.originalError,
			commentTextOnError: this.commentTextOnError,
			formattedMessage: this.toFormattedString(),
			originalErrorStack: this.originalError.stack,
		};
	}
}
