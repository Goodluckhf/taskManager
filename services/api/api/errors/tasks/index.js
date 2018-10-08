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
	constructor(messages, ...args) {
		super(...args);
		this.messages = messages;
	}
	
	/**
	 * @return {string}
	 * @protected
	 */
	_toMessage() {
		const message = super._toMessage();
		return `${message}\n${this.messages.join('\n')}`;
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
	constructor(messages, ...args) {
		super(...args);
		this.messages = messages;
	}
	
	/**
	 * @return {string}
	 * @protected
	 */
	_toMessage() {
		const message = super._toMessage();
		return `${message}\n${this.messages.join('\n')}`;
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
	constructor(messages, ...args) {
		super(...args);
		this.messages = messages;
	}
	
	/**
	 * @return {string}
	 * @protected
	 */
	_toMessage() {
		const message = super._toMessage();
		return `${message}\n${this.messages.join('\n')}`;
	}
}

