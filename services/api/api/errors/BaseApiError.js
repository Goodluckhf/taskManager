export default class BaseApiError extends Error {
	/**
	 * @param {String} message
	 * @param {Number} status
	 */
	constructor(message, status) {
		super(message);
		this.status  = status || 400;
		this.success = false;
	}
	
	toObject() {
		return {
			success: this.success,
			message: this.message,
			status : this.status,
		};
	}
	
	toJson() {
		return JSON.stringify(this.toObject());
	}
}
