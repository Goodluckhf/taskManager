import BaseApiError from './BaseApiError';

export class NotFound extends BaseApiError {
	constructor() {
		super('Nothing found');
		this.status = 404;
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

export class VkApiError extends BaseApiError {
	constructor(error, request) {
		super('Vk Api error');
		this.vkError = error;
		this.request = request;
	}
	
	toObject() {
		return {
			...super.toObject(),
			vkError: this.vkError,
			request: this.request,
		};
	}
}
