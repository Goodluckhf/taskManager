import BaseTaskError from './BaseTaskError';

/**
 * @property {String} link
 * @property {Number} count
 */
export class CommonLikesError extends BaseTaskError {
	constructor(link, count, ...args) {
		super(...args);
		this.link  = link;
		this.count = count;
	}
	
	/**
	 * @return {string}
	 * @protected
	 */
	_toMessage() {
		const message = super._toMessage();
		return `Задача накртуки лайков: ${message}\nСсылка: ${this.link}\nКол-во: ${this.count}`;
	}
}

export class SetLikesValidation extends CommonLikesError {
	/**
	 * @return {string}
	 * @protected
	 */
	_toMessage() {
		const message = super._toMessage();
		return `${message}\n${this.originalError.messages.join('\n')}`;
	}
}


/**
 * @property {String} link
 * @property {Number} count
 */
export class CommonCommentsError extends BaseTaskError {
	constructor(link, count, ...args) {
		super(...args);
		this.link  = link;
		this.count = count;
	}
	
	/**
	 * @return {string}
	 * @protected
	 */
	_toMessage() {
		const message = super._toMessage();
		return `Задача накртуки комментов: ${message}\nСсылка: ${this.link}\nКол-во: ${this.count}`;
	}
}

export class SetCommentsValidation extends CommonCommentsError {
	/**
	 * @return {string}
	 * @protected
	 */
	_toMessage() {
		const message = super._toMessage();
		return `${message}\n${this.originalError.messages.join('\n')}`;
	}
}


/**
 * @property {String} link
 * @property {Number} count
 */
export class CommonRepostsError extends BaseTaskError {
	constructor(link, count, ...args) {
		super(...args);
		this.link  = link;
		this.count = count;
	}
	
	/**
	 * @return {string}
	 * @protected
	 */
	_toMessage() {
		const message = super._toMessage();
		return `Задача накртуки репостов: ${message}\nСсылка: ${this.link}\nКол-во: ${this.count}`;
	}
}

export class SetRepostsValidation extends CommonRepostsError {
	/**
	 * @return {string}
	 * @protected
	 */
	_toMessage() {
		const message = super._toMessage();
		return `${message}\n${this.originalError.messages.join('\n')}`;
	}
}

export class NotEnoughBalance extends BaseTaskError {
	constructor(activeBalance, needBalance, ...args) {
		super(...args);
		this.activeBalance = activeBalance;
		this.needBalance   = needBalance;
	}
	
	/**
	 * @return {string}
	 * @protected
	 */
	_toMessage() {
		const message = super._toMessage();
		return `${message} Недостаточно средств на балансе\nДоступный баланса: ${this.activeBalance}\nНеобходимо средств ${this.needBalance}`;
	}
}
