import BaseApiError from './BaseApiError';

export class NotFound extends BaseApiError {
	constructor() {
		super('Nothing found');
	}
}

export class ValidationError extends BaseApiError {
	constructor() {
		super('Validation error. Please check data');
	}
}
