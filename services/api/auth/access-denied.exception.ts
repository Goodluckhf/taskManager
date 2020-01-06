import { Request } from 'express';
import {
	FormattableInterface,
	HttpStatusableInterface,
	ObjectableInterface,
} from '../../../lib/internal.types';

export class AccessDeniedException extends Error
	implements FormattableInterface, HttpStatusableInterface, ObjectableInterface {
	private readonly userId: string;

	private readonly request: Request;

	readonly status = 403;

	constructor(userId: string, request: Request) {
		super('Access denied');

		this.userId = userId;
		this.request = request;
	}

	toFormattedString(): string {
		return this.message;
	}

	toObject(): object {
		return {
			userId: this.userId,
			url: this.request.url,
		};
	}
}
