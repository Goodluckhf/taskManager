/**
 * @property {Logger} logger
 * @property {Config} config
 */
class Response {
	constructor({ logger, config }) {
		this.logger = logger;
		this.config = config;
	}
	
	/**
	 * @return {String}
	 * @abstract
	 */
	// eslint-disable-next-line class-methods-use-this,
	get method() {
		throw new Error('must be implemented');
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
