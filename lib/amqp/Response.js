/**
 * @property {String} queue
 * @property {Number} prefetch
 */
class Response {
	constructor({ logger, queue, prefetch }) {
		this.queue    = queue;
		this.prefetch = prefetch;
		this.logger   = logger;
	}
	/**
	 * @param {String} method
	 * @param {Object} args
	 * @return {Promise<void>}
	 * @abstract
	 */
	// eslint-disable-next-line class-methods-use-this, no-unused-vars
	async process(method, args) {
		throw new Error('Should be implemented in sub class');
	}
}

export default Response;
