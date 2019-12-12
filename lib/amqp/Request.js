/**
 * @property {String} queue
 * @property {Number} prefetch
 * @property {Number} timeout
 * @property {String} method
 * @property {Object} args
 */
class Request {
	constructor({ queue, timeout, method = null, args = null, retriesLimit = 0 }) {
		this.queue = queue;
		this.timeout = timeout;

		this.method = method;
		this.args = args;
		this.retriesLimit = retriesLimit;
	}

	/**
	 * @param {String} method
	 * @param {Object} args
	 * @return {Request}
	 */
	setMethod(method, args) {
		this.method = method;
		this.args = args;
		return this;
	}

	/**
	 * @return {string}
	 */
	toJson() {
		return JSON.stringify({
			method: this.method,
			args: this.args,
		});
	}
}

export default Request;
