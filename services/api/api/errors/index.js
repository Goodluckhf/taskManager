import BaseApiError from './BaseApiError';

export class NotFound extends BaseApiError {
	constructor() {
		super('Nothing found');
	}
}

export class ValidationError extends BaseApiError {
	constructor(invalidParams) {
		super('Validation error. Please check data');
		this.invalidParams = invalidParams;
	}
	
	toObject() {
		return {
			...super.toObject(),
			invalidParams: this.invalidParams,
		};
	}
}
