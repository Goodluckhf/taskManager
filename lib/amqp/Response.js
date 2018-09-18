/**
 * @property {String} method
 */
class Response {
	constructor({ logger, method }) {
		this.logger   = logger;
		this.method   = method;
	}
	/**
	 * @param {Object} args
	 * @return {Promise<void>}
	 * @abstract
	 */
	// eslint-disable-next-line class-methods-use-this, no-unused-vars
	async process(args) {
		throw new Error('Should be implemented in sub class');
	}
}

export default Response;
