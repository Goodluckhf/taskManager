import BaseApiError from './BaseApiError';

export class NotFound extends BaseApiError {
	constructor({ what, query }) {
		super('Nothing found');
		this.what   = what;
		this.query  = query;
		this.status = 404;
	}
	
	toObject() {
		return {
			...super.toObject(),
			what : this.what,
			query: this.query,
		};
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
	
	/**
	 * @param {mongoose.Error.ValidationError} _error
	 * @return {ValidationError}
	 */
	static createFromMongooseValidationError(_error) {
		const errors = Object.keys(_error.errors).map((error) => {
			return {
				field  : error,
				message: _error.errors[error].message,
			};
		});
		return new this(errors);
	}
	
	/**
	 * @param {mongoose.Error.CastError} _error
	 * @return {ValidationError}
	 */
	static createFromMongooseCastError(_error) {
		return new this([{
			field  : _error.path,
			message: _error.message,
		}]);
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
