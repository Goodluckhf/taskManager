/**
 * @property {Number} statusCode
 * @property {Error} originalError
 */
class BaseTaskError extends Error {
	/**
	 * @param {Error} error
	 */
	constructor(error) {
		super(error.message);
		this.originalError = error;
		if (error.statusCode) {
			this.statusCode = error.statusCode;
		}
	}
	
	toObject() {
		const error = this;
		error.formattedMessage = this._toMessage();
		error.message          = this.message;
		return error;
	}
	
	/**
	 * @abstract
	 * @protected
	 * @return {String}
	 */
	_toMessage() {
		return `${this.message}`;
	}
	
	/**
	 * @return {string}
	 */
	toMessageString() {
		return `--------------\n${this._toMessage()}\n----------------`;
	}
}

export default BaseTaskError;
