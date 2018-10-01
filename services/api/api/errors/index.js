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

/**
 * @property {Request} request
 * @property {Object} error
 */
export class TaskApiError extends BaseApiError {
	constructor(request, error) {
		super('During task handling error occurred');
		this.request = request;
		this.error   = error;
	}
	
	toObject() {
		return {
			...super.toObject(),
			error  : this.error,
			request: this.request,
		};
	}
}

export class TaskAlreadyExist extends BaseApiError {
	constructor({ id, groupId }) {
		super('Task for such group already exists');
		this.id      = id;
		this.groupId = groupId;
	}
	
	toObject() {
		return {
			...super.toObject(),
			id     : this.id,
			groupId: this.groupId,
		};
	}
}

export class GroupAlreadyExist extends BaseApiError {
	constructor({ id, name }) {
		super('Group has already exists');
		this.id   = id;
		this.name = name;
	}
	
	toObject() {
		return {
			...super.toObject(),
			id  : this.id,
			name: this.name,
		};
	}
}

export class WallSeekAlreadyExist extends BaseApiError {
	constructor({ link, id }) {
		super('Wall seek task for this group has already exists');
		this.id   = id;
		this.link = link;
	}
	
	toObject() {
		return {
			...super.toObject(),
			id  : this.id,
			link: this.link,
		};
	}
}

export class LoginFailed extends BaseApiError {
	constructor({ email }) {
		super('Login failed. Check login or password');
		this.email = email;
	}
	
	toObject() {
		return {
			...super.toObject(),
			email: this.email,
		};
	}
}


export class UserAlreadyExists extends BaseApiError {
	constructor({ email }) {
		super('User has already exists');
		this.email = email;
	}
	
	toObject() {
		return {
			...super.toObject(),
			email: this.email,
		};
	}
}

export class UserIsNotReady extends BaseApiError {
	constructor(fields) {
		super('You have to fill settings for your account');
		this.fields = fields;
	}
	
	toObject() {
		return {
			...super.toObject(),
			fields: this.fields,
		};
	}
}

