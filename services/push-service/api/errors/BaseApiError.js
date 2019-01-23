import BaseError from './BaseError';

export default class BaseApiError extends BaseError {
	/**
	 * @param {String} message
	 * @param {Number} [status]
	 */
	constructor(message, status) {
		super(message);
		this.status = status || 400;
		this.success = false;
		this.extraParams = [];
	}

	toObject() {
		const object = {
			success: this.success,
			message: this.message,
			status: this.status,
		};

		if (this.extraParams.length) {
			object.extraParams = this.extraParams;
		}

		return object;
	}

	/**
	 * @return {String}
	 */
	toMessageString() {
		return `Не предвиденная ошибка!\n${this.message}`;
	}

	/**
	 * @description Добавляет параметр к ошибке
	 * @param {*} param
	 * @return {BaseApiError}
	 */
	combine(param) {
		this.extraParams.push(param);
		return this;
	}
}
