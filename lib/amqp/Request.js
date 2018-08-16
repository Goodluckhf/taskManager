/**
 * @property {String} queue
 * @property {Number} prefetch
 * @property {Number} timeout
 * @property {String} method
 * @property {Object} args
 */
class Request {
	constructor({ queue, timeout }) {
		this.queue    = queue;
		this.timeout  = timeout;
		
		this.method = null;
		this.args   = null;
	}
	
	/**
	 * @param {String} method
	 * @param {Object} args
	 * @return {Request}
	 */
	setMethod(method, args) {
		this.method = method;
		this.args   = args;
		return this;
	}
	
	/**
	 * @return {string}
	 */
	toJson() {
		return JSON.stringify({
			method: this.method,
			args  : this.args,
		});
	}
}

export default Request;
