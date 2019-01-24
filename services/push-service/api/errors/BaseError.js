class BaseError extends Error {
	/**
	 * @abstract
	 */
	// eslint-disable-next-line class-methods-use-this
	toMessageString() {}
}

export default BaseError;
