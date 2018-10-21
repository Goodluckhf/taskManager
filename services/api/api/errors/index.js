import BaseApiError from './BaseApiError';

export class NotFound extends BaseApiError {
	constructor({ what, query }) {
		super('Ничего не найдено');
		this.what   = what;
		this.query  = query;
		this.status = 404;
	}
	
	toMessageString() {
		return `${this.message}\nПо запросу "${this.what}" ничего не найдено`;
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
		super('Ошибка валидации. Проверьте введенные данные');
		this.invalidParams = invalidParams;
	}
	
	toMessageString() {
		const params = this.invalidParams.map((param) => {
			if (param.dataPath) {
				return param.dataPath;
			}
			
			if (typeof param === 'object') {
				return JSON.stringify(param, null, 2);
			}
			
			return param;
		});
		return `${this.message}\n${params.join('\n')}`;
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
		super('Ошибка от API vk.com');
		this.vkError = error;
		this.request = request;
	}
	
	toMessageString() {
		return `${this.message}\nПроверьте введенные данные и попробуйте еще раз\nЕсли ошибка повторяется свяжитесь с админом`;
	}
	
	toObject() {
		//eslint-disable-next-line camelcase
		const { access_token, ...request } = this.request;
		return {
			...super.toObject(),
			vkError: this.vkError,
			request,
		};
	}
}

/**
 * @property {Request} request
 * @property {Object} error
 */
export class TaskApiError extends BaseApiError {
	constructor(request, error) {
		super('Во время выполнения задачи произошла ошибка');
		this.request = request;
		this.error   = error;
	}
	
	toMessageString() {
		return `${this.message}`;
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
		super('Для этой группы задача уже создана');
		this.id      = id;
		this.groupId = groupId;
	}
	
	toMessageString() {
		return `${this.message}`;
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
		super('Группа уже существует');
		this.id   = id;
		this.name = name;
	}
	
	toMessageString() {
		return `${this.message}\nПопробуйте сменить фильтр. Возможно ее уже кто-то добавил`;
	}
	
	toObject() {
		return {
			...super.toObject(),
			id  : this.id,
			name: this.name,
		};
	}
}

/**
 * @TODO: Когда понадобится доделать
 */
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
		super('Ошбика авторизации');
		this.email = email;
	}
	
	toMessageString() {
		return `${this.message}\nНе правильный логин или пароль`;
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
		super('Пользоветель уже сущесвует');
		this.email = email;
	}
	
	toMessageString() {
		return `${this.message}\nПочта "${this.email}" уже занята (возможно вами)`;
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
		super('Пользователь не готов к создании задачи');
		this.fields = fields;
	}
	
	toMessageString() {
		return `${this.message}\nНеобходимо заполнить данные (${this.fields.join(', ')})`;
	}
	
	toObject() {
		return {
			...super.toObject(),
			fields: this.fields,
		};
	}
}

export class NoFriendsInvite extends BaseApiError {
	constructor(link) {
		super('Вы не отправили запрос в друзья боту');
		this.link = link;
	}
	
	toMessageString() {
		return `${this.message}\nНужно отправить запрос в друзья пользователю по ссылке: ${this.link}`;
	}
	
	toObject() {
		return {
			...super.toObject(),
			link: this.link,
		};
	}
}

export class ChatAlreadyExists extends BaseApiError {
	constructor(chatId) {
		super('Чат для алертов уже создан');
		this.chatId = chatId;
	}
	
	toMessageString() {
		return `${this.message}\nЧат с ботом для алертов уже был создан ранее`;
	}
	
	toObject() {
		return {
			...super.toObject(),
			chatId: this.chatId,
		};
	}
}

export class CheckPaymentFailure extends BaseApiError {
	constructor(amount, note, reason) {
		super('Ошибка проверки оплаты');
		this.amount = amount;
		this.note   = note;
		this.reason = reason;
	}
	
	toMessageString() {
		return `${this.message}\nУбедитесь что перевели нужную сумму: ${this.amount}; с примечанием "${this.note}"`;
	}
	
	toObject() {
		return {
			...super.toObject(),
			amount : this.amount,
			comment: this.note,
			reason : this.reason,
		};
	}
}

